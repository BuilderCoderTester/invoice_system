Invoice Management System
A full-stack invoice management application with authentication, PDF generation, multi-currency, tax calculation, and overdue tracking.
📋 Table of Contents
Prerequisites
Installation Steps
Database Setup
Environment Configuration
Running the Application
Usage Guide
Project Structure
Features
Tech Stack
Troubleshooting
Prerequisites
Before starting, ensure you have these installed on your computer:
Table
Copy
Software	Minimum Version	Download Link
Node.js	18.x	https://nodejs.org/
MySQL	8.x	https://dev.mysql.com/downloads/
Git	Latest	https://git-scm.com/downloads
Verify Installations
Open your terminal/command prompt and run:
bash
Copy
# Check Node.js
node --version
# Should show v18.x.x or higher

# Check npm
npm --version
# Should show 9.x.x or higher

# Check MySQL
mysql --version
# Should show 8.x.x or higher

# Check Git
git --version
# Should show 2.x.x or higher
Installation Steps
Step 1: Clone the Repository
bash
Copy
# Open your terminal
# Navigate to where you want to install (example: Desktop)
cd Desktop

# Clone the repository
git clone https://github.com/YOUR_USERNAME/invoice-system.git

# Enter the project folder
cd invoice-system
Step 2: Install Root Dependencies
bash
Copy
# Install the main dependencies
npm install
Step 3: Install Server Dependencies
bash
Copy
# Navigate to server folder
cd server

# Install server dependencies
npm install

# Return to root
cd ..
Step 4: Install Client Dependencies
bash
Copy
# Navigate to client folder
cd client

# Install client dependencies
npm install

# Return to root
cd ..
Alternative: Install all at once
bash
Copy
# From root folder, run:
npm run setup
Database Setup
Step 1: Start MySQL Server
Windows:
bash
Copy
# Open Services app
# Find MySQL80
# Click Start

# OR use command line:
net start MySQL80
Mac:
bash
Copy
# Start MySQL
brew services start mysql

# OR
sudo mysql.server start
Linux:
bash
Copy
sudo systemctl start mysql
Step 2: Create Database (Optional)
The app auto-creates the database, but you can create it manually:
bash
Copy
# Login to MySQL
mysql -u root -p

# Enter your MySQL password when prompted

# Create database
CREATE DATABASE IF NOT EXISTS invoice_db;

# Exit
EXIT;
Step 3: Verify Database Connection
The application will automatically:
Create the database if it doesn't exist
Create all required tables
Set up foreign key relationships
Environment Configuration
Step 1: Create Environment File
bash
Copy
# Navigate to server folder
cd server

# Copy the example environment file
cp .env.example .env

# If on Windows (Command Prompt):
copy .env.example .env

# If on Windows (PowerShell):
Copy-Item .env.example .env
Step 2: Edit Environment Variables
Open server/.env in your text editor and update:
env
Copy
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=invoice_db
PORT=3001

# JWT Secret (change this to any random string)
JWT_SECRET=your-secret-key-change-this-in-production-2024
How to find your MySQL password:
If you just installed MySQL, it's the password you set during installation
If you forgot, you may need to reset it
For XAMPP/WAMP, it's usually blank (leave empty)
Step 3: Save the File
Make sure to save after editing!
Running the Application
Option 1: Run Both (Recommended)
bash
Copy
# From the root folder (invoice-system/)
npm run dev
This starts:
Backend server at http://localhost:3001
Frontend client at http://localhost:5173
Option 2: Run Separately
Terminal 1 - Backend:
bash
Copy
cd server
npm run dev
Terminal 2 - Frontend:
bash
Copy
cd client
npm run dev
Step 4: Open in Browser
plain
Copy
http://localhost:5173
Usage Guide
First Time Setup
Open the application at http://localhost:5173
Click "Sign Up" to create a new account
Fill in the form:
Full Name: Your name
Email: your@email.com
Password: minimum 6 characters
Confirm Password: same as password
Click "Create Account"
You'll be redirected to the dashboard
Creating Your First Invoice
Option A: Use Sample Data
Click the green "Seed Data" button
This creates a sample invoice with line items
Option B: Create Manually
Click the blue "Create Invoice" button
Fill in the form:
Invoice Number: INV-2024-001
Customer Name: Acme Corporation
Customer Email: contact@acme.com
Issue Date: Today
Due Date: 30 days from now
Line Items: Add descriptions, quantities, and prices
Click "Create Invoice"
Managing Invoices
Table
Copy
Action	How To
View Invoice	Click on any invoice card
Record Payment	Open invoice → Click "Record Payment" → Enter amount
Download PDF	Open invoice → Click "Download" button
Archive Invoice	Open invoice → Click "Archive Invoice"
Restore Invoice	Open archived invoice → Click "Restore"
Check Tax	Open invoice → Click calculator icon
Convert Currency	Open invoice → Select currency from dropdown
Adding a Payment
Open an invoice
Click "Record Payment"
Enter payment amount
Click "Confirm Payment"
Watch the progress bar update!
Project Structure
plain
Copy
invoice-system/
├── README.md                 # This file
├── package.json              # Root package.json
├── .gitignore               # Git ignore rules
│
├── server/                   # Backend folder
│   ├── src/
│   │   ├── index.js         # Main server file
│   │   └── db.js            # Database connection
│   ├── package.json         # Server dependencies
│   └── .env.example         # Environment template
│
└── client/                   # Frontend folder
    ├── src/
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   ├── index.css        # Global styles
    │   ├── context/
    │   │   └── AuthContext.jsx    # Authentication context
    │   ├── pages/
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Signup.jsx         # Signup page
    │   │   ├── InvoiceList.jsx    # Invoice list page
    │   │   └── InvoiceDetails.jsx # Invoice detail page
    │   ├── components/
    │   │   ├── PaymentModal.jsx   # Payment modal
    │   │   ├── TaxCalculator.jsx  # Tax calculator
    │   │   ├── CurrencyConverter.jsx # Currency converter
    │   │   └── ProtectedRoute.jsx # Route protection
    │   └── utils/
    │       └── formatters.js      # Utility functions
    ├── package.json         # Client dependencies
    └── tailwind.config.js   # Tailwind configuration
Features
Core Features
✅ User Authentication - Secure JWT-based auth with signup/login
✅ Invoice Management - Create, view, archive, restore invoices
✅ Payment Tracking - Record payments, automatic balance calculation
✅ PDF Generation - Download invoices as PDF files
✅ Multi-Currency - Support for USD, EUR, GBP, INR, JPY
✅ Tax Calculation - Automatic tax calculation by country
✅ Overdue Tracking - Visual alerts for overdue invoices
✅ Archive System - Soft delete with restore functionality
Advanced Features
✅ Real-time Updates - Instant UI updates after actions
✅ Progress Tracking - Visual payment progress bars
✅ Responsive Design - Works on desktop and mobile
✅ Form Validation - Client and server-side validation
✅ Error Handling - User-friendly error messages
Tech Stack
Frontend
Table
Copy
Technology	Purpose
React 18	UI Library
React Router	Navigation
Tailwind CSS	Styling
Lucide React	Icons
Vite	Build Tool
Backend
Table
Copy
Technology	Purpose
Express.js	Web Framework
MySQL2	Database Driver
JWT	Authentication
bcryptjs	Password Hashing
PDFKit	PDF Generation
CORS	Cross-Origin Requests
Database
Table
Copy
Technology	Purpose
MySQL 8	Relational Database
Troubleshooting
Issue: "Cannot connect to database"
Solution:
bash
Copy
# 1. Check if MySQL is running
# Windows:
net start MySQL80

# Mac:
brew services start mysql

# Linux:
sudo systemctl start mysql

# 2. Check your .env file
# Make sure DB_PASSWORD matches your MySQL password
Issue: "Port already in use"
Solution:
bash
Copy
# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Kill process on port 3001 (Mac/Linux)
lsof -ti:3001 | xargs kill -9

# Or change the port in server/.env
PORT=3002
Issue: "Module not found"
Solution:
bash
Copy
# Reinstall dependencies
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules

npm run setup
Issue: "Login not working"
Solution:
Check browser console for errors
Verify server is running on port 3001
Check that MySQL is running
Verify JWT_SECRET is set in .env
Issue: "PDF download not working"
Solution:
bash
Copy
# Install PDFKit
cd server
npm install pdfkit
Issue: "Styles not loading"
Solution:
bash
Copy
# Restart the client
cd client
npm run dev
Development Commands
Table
Copy
Command	Description	Location
npm run setup	Install all dependencies	Root
npm run dev	Start both servers	Root
npm run server	Start backend only	Root
npm run client	Start frontend only	Root
npm install	Install dependencies	Any folder
Production Deployment
Build for Production
bash
Copy
# Build frontend
cd client
npm run build

# The build folder is now ready to be deployed
Environment Variables for Production
env
Copy
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=invoice_db
PORT=3001
JWT_SECRET=very-long-random-secret-key-min-32-chars
Support
If you encounter issues:
Check the Troubleshooting section
Check server logs in the terminal
Check browser console for frontend errors
Ensure all prerequisites are installed
License
MIT License - Feel free to use this project for personal or commercial purposes.
Happy Invoicing! 🎉