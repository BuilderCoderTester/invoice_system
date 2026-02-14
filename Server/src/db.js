const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'invoice_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDatabase() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'invoice_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'invoice_db'}`);
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Invoices table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
        customerName VARCHAR(255) NOT NULL,
        customerEmail VARCHAR(255),
        customerAddress TEXT,
        issueDate DATE NOT NULL,
        dueDate DATE NOT NULL,
        status ENUM('DRAFT', 'PAID') DEFAULT 'DRAFT',
        isArchived BOOLEAN DEFAULT FALSE,
        currency VARCHAR(3) DEFAULT 'USD',
        taxRate DECIMAL(5,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Invoice lines table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_lines (
        id VARCHAR(36) PRIMARY KEY,
        invoiceId VARCHAR(36) NOT NULL,
        description TEXT NOT NULL,
        quantity INT NOT NULL,
        unitPrice DECIMAL(10, 2) NOT NULL,
        lineTotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);
    
    // Payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        invoiceId VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, initDatabase };