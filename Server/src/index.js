const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { pool, initDatabase } = require("./db");
const PDFDocument = require("pdfkit");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists in database
    const [users] = await pool.query("SELECT id, email, name FROM users WHERE id = ?", [verified.userId]);
    if (users.length === 0) {
      return res.status(403).json({ error: "User not found" });
    }
    
    req.user = users[0];
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// ============================================
// AUTH ROUTES
// ============================================

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    // Check if user exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    // Create user
    await pool.query(
      "INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)",
      [userId, email, hashedPassword, name || email.split('@')[0]]
    );
    
    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    
    res.status(201).json({
      token,
      user: { id: userId, email, name: name || email.split('@')[0] }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    // Find user
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    
    const user = users[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET CURRENT USER
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  res.json(req.user);
});

// ============================================
// INVOICE ROUTES (PROTECTED)
// ============================================

// Helper: Calculate totals
async function calculateInvoiceTotals(invoiceId) {
  const [lineItems] = await pool.query(
    "SELECT lineTotal FROM invoice_lines WHERE invoiceId = ?",
    [invoiceId]
  );
  const [payments] = await pool.query(
    "SELECT amount FROM payments WHERE invoiceId = ?",
    [invoiceId]
  );
  
  const total = lineItems.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const amountPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  return { total, amountPaid, balanceDue: total - amountPaid };
}

// SEED DATA FOR CURRENT USER
app.post("/api/seed", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.user.id;
    
    // Create invoice
    const invoiceId = uuidv4();
    await connection.query(
      `INSERT INTO invoices (id, userId, invoiceNumber, customerName, customerEmail, issueDate, dueDate, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        userId,
        "INV-2024-001",
        "Acme Corporation",
        "contact@acme.com",
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "DRAFT",
      ]
    );

    // Create line items
    const lineItems = [
      { desc: "Web Development Services", qty: 40, price: 150.0, total: 6000.0 },
      { desc: "UI/UX Design", qty: 20, price: 125.0, total: 2500.0 },
      { desc: "Hosting Setup", qty: 1, price: 499.99, total: 499.99 },
    ];

    for (const item of lineItems) {
      await connection.query(
        `INSERT INTO invoice_lines (id, invoiceId, description, quantity, unitPrice, lineTotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), invoiceId, item.desc, item.qty, item.price, item.total]
      );
    }

    await connection.commit();

    res.json({
      message: "Database seeded successfully",
      invoiceId,
      invoiceNumber: "INV-2024-001",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to seed database" });
  } finally {
    connection.release();
  }
});

// GET ALL INVOICES (for current user)
app.get("/api/invoices", authenticateToken, async (req, res) => {
  try {
    const [invoices] = await pool.query(`
      SELECT i.*, 
        COALESCE(SUM(il.lineTotal), 0) as total,
        COALESCE(SUM(p.amount), 0) as amountPaid
      FROM invoices i
      LEFT JOIN invoice_lines il ON i.id = il.invoiceId
      LEFT JOIN payments p ON i.id = p.invoiceId
      WHERE i.userId = ?
      GROUP BY i.id
      ORDER BY i.createdAt DESC
    `, [req.user.id]);

    res.json(invoices.map(inv => ({
      ...inv,
      balanceDue: Number(inv.total) - Number(inv.amountPaid)
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// GET SINGLE INVOICE (verify ownership)
app.get("/api/invoices/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [invoices] = await pool.query(
      "SELECT * FROM invoices WHERE id = ? AND userId = ?",
      [id, req.user.id]
    );
    
    if (invoices.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const [lineItems] = await pool.query(
      "SELECT * FROM invoice_lines WHERE invoiceId = ?",
      [id]
    );
    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE invoiceId = ? ORDER BY paymentDate DESC",
      [id]
    );

    const totals = await calculateInvoiceTotals(id);

    res.json({
      ...invoices[0],
      lineItems,
      payments,
      ...totals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// CREATE NEW INVOICE
app.post("/api/invoices", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { invoiceNumber, customerName, customerEmail, customerAddress, issueDate, dueDate, lineItems, currency, taxRate } = req.body;
    
    if (!invoiceNumber || !customerName || !dueDate || !lineItems?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await connection.beginTransaction();

    const invoiceId = uuidv4();
    await connection.query(
      `INSERT INTO invoices (id, userId, invoiceNumber, customerName, customerEmail, customerAddress, issueDate, dueDate, currency, taxRate, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, req.user.id, invoiceNumber, customerName, customerEmail, customerAddress, issueDate, dueDate, currency || 'USD', taxRate || 0, 'DRAFT']
    );

    for (const item of lineItems) {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      await connection.query(
        `INSERT INTO invoice_lines (id, invoiceId, description, quantity, unitPrice, lineTotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), invoiceId, item.description, item.quantity, item.unitPrice, lineTotal]
      );
    }

    await connection.commit();

    res.status(201).json({ 
      message: "Invoice created",
      invoiceId,
      invoiceNumber
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to create invoice" });
  } finally {
    connection.release();
  }
});

// ADD PAYMENT
app.post("/api/invoices/:id/payments", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Verify invoice belongs to user
    const [invoices] = await pool.query(
      "SELECT * FROM invoices WHERE id = ? AND userId = ?",
      [id, req.user.id]
    );
    
    if (invoices.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const totals = await calculateInvoiceTotals(id);

    if (Number(amount) > totals.balanceDue) {
      return res.status(400).json({ error: "Amount exceeds balance" });
    }

    await connection.beginTransaction();

    const paymentId = uuidv4();
    await connection.query(
      "INSERT INTO payments (id, invoiceId, amount) VALUES (?, ?, ?)",
      [paymentId, id, amount]
    );

    const newTotals = await calculateInvoiceTotals(id);
    if (newTotals.balanceDue === 0) {
      await connection.query("UPDATE invoices SET status = 'PAID' WHERE id = ?", [id]);
    }

    await connection.commit();
    res.json({ payment: { id: paymentId, amount }, totals: newTotals });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to add payment" });
  } finally {
    connection.release();
  }
});

// ARCHIVE
app.post("/api/invoices/:id/archive", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      "UPDATE invoices SET isArchived = TRUE WHERE id = ? AND userId = ?",
      [id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    const [invoice] = await pool.query("SELECT * FROM invoices WHERE id = ?", [id]);
    res.json(invoice[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to archive invoice" });
  }
});

// RESTORE
app.post("/api/invoices/:id/restore", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      "UPDATE invoices SET isArchived = FALSE WHERE id = ? AND userId = ?",
      [id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    const [invoice] = await pool.query("SELECT * FROM invoices WHERE id = ?", [id]);
    res.json(invoice[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to restore invoice" });
  }
});

// PDF GENERATION
app.get("/api/invoices/:id/pdf", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [invoices] = await pool.query(
      "SELECT * FROM invoices WHERE id = ? AND userId = ?",
      [id, req.user.id]
    );
    
    if (invoices.length === 0) return res.status(404).json({ error: "Not found" });
    
    const invoice = invoices[0];
    const [lineItems] = await pool.query("SELECT * FROM invoice_lines WHERE invoiceId = ?", [id]);
    const [payments] = await pool.query("SELECT * FROM payments WHERE invoiceId = ?", [id]);
    
    const doc = new PDFDocument();
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(25).text("INVOICE", 50, 50);
    doc.fontSize(12).text(`#${invoice.invoiceNumber}`, 50, 80);
    
    // Status
    doc.fontSize(14)
       .fillColor(invoice.status === "PAID" ? "green" : "red")
       .text(invoice.status, 400, 50);
    
    // Company Info
    doc.fillColor("black");
    doc.fontSize(12).text("From:", 50, 120);
    doc.fontSize(10).text(req.user.name || "Your Company", 50, 140);
    doc.text(req.user.email, 50, 155);
    
    // Customer Info
    doc.fontSize(12).text("Bill To:", 300, 120);
    doc.fontSize(10).text(invoice.customerName, 300, 140);
    if (invoice.customerEmail) doc.text(invoice.customerEmail, 300, 155);
    
    // Dates
    doc.fontSize(12).text("Invoice Date:", 50, 200);
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 150, 200);
    doc.text("Due Date:", 50, 220);
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), 150, 220);
    
    // Line Items
    doc.fontSize(12).text("Description", 50, 280);
    doc.text("Qty", 300, 280);
    doc.text("Price", 380, 280);
    doc.text("Total", 480, 280);
    
    doc.moveTo(50, 295).lineTo(550, 295).stroke();
    
    let y = 310;
    lineItems.forEach(item => {
      doc.fontSize(10).text(item.description, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`$${item.unitPrice}`, 380, y);
      doc.text(`$${item.lineTotal}`, 480, y);
      y += 20;
    });
    
    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
    
    const total = lineItems.reduce((sum, item) => sum + Number(item.lineTotal), 0);
    const amountPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    doc.fontSize(12).text("Total:", 380, y + 30);
    doc.text(`$${total.toFixed(2)}`, 480, y + 30);
    doc.text("Amount Paid:", 380, y + 50);
    doc.text(`$${amountPaid.toFixed(2)}`, 480, y + 50);
    doc.fontSize(14).text("Balance Due:", 380, y + 80);
    doc.text(`$${(total - amountPaid).toFixed(2)}`, 480, y + 80);
    
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// ============================================
// UTILITIES
// ============================================

const currencyRates = { USD: 1, EUR: 0.85, GBP: 0.73, INR: 83.12, JPY: 149.50 };
const taxRates = { US: 0.08, UK: 0.20, EU: 0.19, IN: 0.18, JP: 0.10 };

app.post("/api/convert-currency", authenticateToken, (req, res) => {
  const { amount, from, to } = req.body;
  const rate = currencyRates[to] / currencyRates[from];
  res.json({ original: amount, converted: amount * rate, rate, currency: to });
});

app.post("/api/calculate-tax", authenticateToken, (req, res) => {
  const { amount, country } = req.body;
  const taxRate = taxRates[country] || 0;
  const taxAmount = amount * taxRate;
  res.json({ subtotal: amount, taxRate: taxRate * 100, taxAmount, total: amount + taxAmount });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

async function startServer() {
  await initDatabase();
  console.log("✅ Database ready");
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);