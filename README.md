💼 Invoice Management System

A full-stack invoice management application with authentication, PDF generation, multi-currency support, tax calculation, and overdue tracking.

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

📦 Prerequisites

Make sure you have the following installed:

Software	Minimum Version	Download
Node.js	18.x	https://nodejs.org/

MySQL	8.x	https://dev.mysql.com/downloads/

Git	Latest	https://git-scm.com/downloads
🔎 Verify Installations
# Check Node.js
node --version

# Check npm
npm --version

# Check MySQL
mysql --version

# Check Git
git --version

🚀 Installation Steps
Step 1: Clone the Repository
cd Desktop
git clone https://github.com/YOUR_USERNAME/invoice-system.git
cd invoice-system

Step 2: Install Root Dependencies
npm install

Step 3: Install Server Dependencies
cd server
npm install
cd ..

Step 4: Install Client Dependencies
cd client
npm install
cd ..

🗄 Database Setup
Step 1: Start MySQL Server
Windows (Command Line)
net start MySQL80

Step 2: Create Database (Optional)

The application automatically creates the database, but you may create it manually:

mysql -u root -p


Then inside MySQL:

CREATE DATABASE IF NOT EXISTS invoice_db;
EXIT;

Step 3: Automatic Setup

On startup, the backend will:

Create the database if it doesn’t exist

Create all required tables

Establish foreign key relationships

⚙ Environment Configuration
Step 1: Create Environment File
cd server
cp .env.example .env

Windows:
copy .env.example .env

Step 2: Configure Environment Variables

Edit server/.env:

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=invoice_db
PORT=3001

# JWT Secret
JWT_SECRET=your-secret-key-change-this-in-production

▶ Running the Application
Option 1: Run Both (Recommended)
npm run dev


This starts:

Backend → http://localhost:3001

Frontend → http://localhost:5173

Option 2: Run Separately
Terminal 1 – Backend
cd server
npm run dev

Terminal 2 – Frontend
cd client
npm run dev

Open in Browser
http://localhost:5173

📂 Project Structure
invoice-system/
│
├── README.md
├── package.json
├── .gitignore
│
├── server/
│   ├── src/
│   │   ├── index.js
│   │   └── db.js
│   ├── package.json
│   └── .env.example
│
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── InvoiceList.jsx
    │   │   └── InvoiceDetails.jsx
    │   ├── components/
    │   │   ├── PaymentModal.jsx
    │   │   ├── TaxCalculator.jsx
    │   │   ├── CurrencyConverter.jsx
    │   │   └── ProtectedRoute.jsx
    │   └── utils/
    │       └── formatters.js
    ├── package.json
    └── tailwind.config.js

✨ Features
🔐 Core Features

✅ JWT-based Authentication (Signup/Login)

✅ Invoice Creation & Management

✅ Payment Tracking with Auto Balance Updates

✅ PDF Generation for Invoices

✅ Multi-Currency Support (USD, EUR, GBP, INR, JPY)

✅ Country-Based Tax Calculation

✅ Overdue Invoice Alerts

✅ Archive & Restore System

⚡ Advanced Features

🔄 Real-time UI Updates

📊 Payment Progress Visualization

📱 Fully Responsive Design

🧠 Client & Server-side Validation

🛡 Centralized Error Handling

🧱 Tech Stack
Frontend

React

Vite

Tailwind CSS

Context API

Backend

Node.js

Express.js

MySQL

JWT Authentication

🛠 Troubleshooting
Port Already in Use

Change the port in:

PORT=3002

MySQL Connection Error

Verify MySQL is running

Confirm username and password

Ensure database exists

Node Version Error

Run:

node --version


Upgrade if below v18.
