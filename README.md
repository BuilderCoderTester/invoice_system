Invoice Management System
A full-stack invoice management application with authentication, PDF generation, multi-currency, tax calculation, and overdue tracking.

📋 Table of Contents
1.Prerequisites
2.Installation Steps
3.Database Setup
4.Environment Configuration
5.Running the Application
6.Usage Guide
7.Project Structure
8.Features
9.Tech Stack
10.Troubleshooting


Prerequisites
Before starting, ensure you have these installed on your computer:

| Software | Minimum Version | Download Link                      |
| -------- | --------------- | ---------------------------------- |
| Node.js  | 18.x            | <https://nodejs.org/>              |
| MySQL    | 8.x             | <https://dev.mysql.com/downloads/> |
| Git      | Latest          | <https://git-scm.com/downloads>    |

Verify Installations
Open your terminal/command prompt and run:

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

# Open your terminal
# Navigate to where you want to install (example: Desktop)
cd Desktop

# Clone the repository
git clone https://github.com/YOUR_USERNAME/invoice-system.git

# Enter the project folder
cd invoice-system

Step 2: Install Root Dependencies
# Install the main dependencies
npm install
Step 3: Install Server Dependencies
# Navigate to server folder
cd server

# Install server dependencies
npm install

# Return to root
cd ..

Step 4: Install Client Dependencies
# Navigate to client folder
cd client

# Install client dependencies
npm install

# Return to root
cd ..

Database Setup
Step 1: Start MySQL Server
Windows:
# Open Services app
# Find MySQL80
# Click Start

# OR use command line:
net start MySQL80

Step 2: Create Database (Optional)
The app auto-creates the database, but you can create it manually:

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
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=invoice_db
PORT=3001

# JWT Secret (change this to any random string)
JWT_SECRET=your-secret-key-change-this-in-production-2024

Running the Application
Option 1: Run Both (Recommended)
# From the root folder (invoice-system/)
npm run dev

This starts:
Backend server at http://localhost:3001
Frontend client at http://localhost:5173
Option 2: Run Separately
Terminal 1 - Backend:
cd server
npm run dev
Terminal 2 - Frontend:
cd client
npm run dev

Step 4: Open in Browser
http://localhost:5173

Project Structure

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


