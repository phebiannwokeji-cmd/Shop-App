Shop App

A simple shop record and business management application built for small retail businesses.

📌 Project Overview

Shop App is a lightweight web application designed to help small-shop owners and their staff manage the everyday records that are often handled manually in notebooks, spreadsheets, or disconnected tools.

The project focuses on the operational side of a small retail business rather than being a conventional customer-facing e-commerce store. It brings sales, inventory, expenses, customer debts, business summaries, and activity history into one interface.

The application is currently implemented as a React + Vite frontend. It supports a local/demo mode using browser `localStorage` and includes Supabase authentication and PostgreSQL schema scaffolding for a future hosted, multi-user setup.

🎯 Problem the Project Solves

Small businesses need to know, at any point:

•	What was sold?
•	How much stock is left?
•	What expenses were recorded?
•	Which customers still owe money?
•	What has changed in the records?
•	Are there operational issues that need attention?

The project addresses these needs with a single, role-aware shop record system.

👥 Who This Project Is For

The primary users are:

Shop Owners
Owners can use the application to:
•	Monitor sales and expenses.
•	Review inventory.
•	Track customer debts.
•	View business activity and summaries.
•	Review audit history.
•	Identify background risk events such as low stock, large expenses, and aging debts.

Shop Staff
Staff can use the operational sections of the application to:
•	Record sales.
•	Update inventory.
•	Record expenses.
•	Record customer debts.
•	Keep day-to-day shop records up to date.

The role distinction is intentional: staff should be able to perform routine shop operations without automatically receiving every owner-level reporting capability.

✨ Core Features

📊 Owner Dashboard
•	Sales, expenses, inventory, and customer-debt overview.
•	Period-based analytics:
  - Today
  - This week
  - This month
  - All time
•	Business activity summaries.
•	Audit trail for record changes.
•	Background-event monitoring.

🧾 Sales Management
•	Record sales against products in inventory.
•	Calculate sale totals from product pricing.
•	Payment methods:
  - Cash
  - Transfer
  - Card
•	Automatically reduce stock after a sale.
•	Prevent sales that exceed available stock.
•	View recent sales.
•	Edit and soft-delete records with audit logging.

📦 Inventory Management
•	View available products and current stock.
•	Add products.
•	Update stock quantities.
•	Maintain fixed product pricing.
•	Monitor low-stock thresholds.

💸 Expense Tracking
•	Record shop expenses.
•	Track payment method.
•	Flag unusually large expenses.
•	Edit and soft-delete records with audit history.

👥 Customer Debt Tracking
•	Record customer name, phone number, and amount owed.
•	Track unpaid and paid debts.
•	Mark debts as paid.
•	Detect aging unpaid debts.
•	Preserve changes through the audit trail.

🔎 Audit & Background Events

Important record changes are captured using events such as:

•	`CREATED`
•	`EDITED`
•	`DELETED`
•	`MARKED_PAID`

The application also records quiet/background events such as:

•	Low stock.
•	Large expenses.
•	Aging customer debts.

The current local/demo thresholds are:

| Event | Threshold |
| --- | --- |
| Low stock | Below 10 units |
| Large expense | ₦50,000 or more |
| Aging debt | 7 days unpaid |

🧠 Key Decisions Made

This section explains why the project was designed the way it was, rather than only describing what exists.

1. Role-based access

The application distinguishes between owner and staff users.

Why: A shop owner needs visibility into sensitive business information and reporting, while staff primarily need tools for daily operations. Separating these responsibilities creates a clearer workflow and provides a foundation for stronger authorization later.

2. Automatic inventory reduction

Recording a sale automatically reduces the associated product's stock.

Why: Stock should reflect completed sales without requiring staff to perform the same update twice. This reduces manual work and helps prevent inventory records from becoming stale.

3. Fixed product pricing for sales

A sale derives its amount from the product's stored price rather than asking the user to manually calculate the total.

Why: This reduces arithmetic mistakes and keeps normal sales entry fast and consistent.

4. Prevent overselling

A sale is rejected when the requested quantity is greater than available stock.

Why: The application treats inventory consistency as a business rule, not merely a UI concern.

5. Soft deletion instead of immediate removal

Operational records can be marked as deleted rather than being immediately destroyed.

Why: Business records may need to remain traceable. Soft deletion also supports auditing and reduces the risk of losing historical information through an accidental deletion.

6. Audit logging

Changes to important records generate audit entries.

Why: A shop management system should provide some accountability around who created, edited, deleted, or marked records as paid. This becomes especially important when multiple people operate the shop.

7. Background-event detection

The application detects conditions such as low stock, large expenses, and aging debts.

Why: Owners should not have to manually inspect every record to discover potential problems. The system can surface conditions that deserve attention.

8. Local-first/demo persistence

The current frontend uses `localStorage` when Supabase is not configured.

Why: This makes the project immediately runnable for development, demonstrations, UI testing, and prototyping without requiring every developer to create a backend environment first.

This is a deliberate development convenience, not the intended final architecture for a multi-user production deployment.

9. Supabase as the hosted-data direction

The repository includes Supabase client configuration and a PostgreSQL schema.

Why: Supabase provides a practical path from a local prototype toward authenticated, persistent, multi-user data without introducing a large custom backend immediately.

🔄 What Changed & Why

The project's implementation decisions reflect an evolution from a simple shop interface into a more complete shop record and operations system.

From simple data entry to operational workflows

The application does not simply collect isolated records. Actions have consequences.

For example:

Record Sale
   ↓
Calculate Total
   ↓
Reduce Inventory
   ↓
Create Audit Entry
   ↓
Check Low-Stock Condition

Why this matters: It models the relationship between business operations rather than treating each screen as an independent form.

Added owner visibility

The dashboard brings together sales, expenses, stock, debts, and activity.

Why: Owners need a high-level view without manually opening every operational screen.

Added traceability

Audit events and soft deletion preserve a history of important changes.

Why: Business records become more trustworthy when changes can be traced rather than silently disappearing.

Added risk/event detection

The application checks for low stock, large expenses, and aging debts.

Why: These are practical signals that can help a shop owner identify problems early.

Added hosted-backend preparation

The project includes Supabase authentication and a database schema even though the current data context still uses local persistence in the frontend.

Why: This creates a migration path toward a real multi-user system while keeping local development simple.

🏗️ Architecture

The application is organized around React Context providers:

App
├── AuthProvider
│   └── DataProvider
│       └── MainAppContent
│           ├── Navbar
│           ├── Login
│           ├── OwnerDashboard
│           ├── SalesEntry
│           ├── InventoryView
│           ├── ExpenseEntry
│           ├── CustomerDebts
│           └── EditRecordModal

`AuthContext`

Responsible for:
•	Current user state.
•	Staff/owner role detection.
•	Login/logout.
•	Demo login.
•	Persisting the active user in `localStorage`.
•	Supabase Auth integration when configured.

`DataContext`

Centralizes shop operations such as:
•	Adding sales.
•	Reducing inventory.
•	Adding products.
•	Updating stock.
•	Recording expenses.
•	Recording customer debts.
•	Marking debts as paid.
•	Editing records.
•	Soft-deleting records.
•	Creating audit entries.
•	Detecting background events.

`supabase.js`

Provides:
•	Optional Supabase client initialization.
•	Supabase configuration detection.
•	Local demo/seed data.
•	`localStorage` persistence helpers.

📁 Project Structure

Shop-App/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CustomerDebts.jsx
│   │   ├── EditRecordModal.jsx
│   │   ├── ExpenseEntry.jsx
│   │   ├── InventoryView.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   ├── OwnerDashboard.jsx
│   │   └── SalesEntry.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── DataContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   └── schema.sql
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── .gitignore

🛠️ Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 |
| Build tool | Vite |
| Language | JavaScript / JSX |
| Icons | Lucide React |
| Authentication | Supabase Auth when configured |
| Database schema | Supabase / PostgreSQL |
| Local persistence | Browser `localStorage` |
| Linting | Oxlint |
| Deployment | Vercel-compatible Vite build |

🚀 Getting Started

Prerequisites

•	Node.js 18+ (Node.js 20+ recommended)
•	npm

Clone the repository

git clone git@github.com:phebiannwokeji-cmd/Shop-App.git
cd Shop-App

Install dependencies

npm install

Start development

npm run dev

Vite normally serves the application at:

http://localhost:5173

Build for production

npm run build

Preview production build

npm run preview

Run linting

npm run lint

🔐 Authentication

The application supports two operating modes.

Local/demo mode

If Supabase environment variables are not configured, the application uses a local demo authentication flow.

The demo includes:
•	Staff
•	Owner

The local fallback is intended for development and demonstration only.

**Security note:** The local fallback is not production authentication. It should not be treated as a secure password-based authentication system.

Supabase mode

Configure:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Create `.env.local` in the project root:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

Do not commit private credentials or secrets.

💾 Data Persistence

When Supabase is not configured, operational data is stored in browser `localStorage` using:

shop_record_book_data_v1

The local engine includes seeded example data for:
•	Products.
•	Sales.
•	Expenses.
•	Customer debts.
•	Audit logs.
•	Background events.

The application uses Nigerian Naira (`₦` / `NGN`) throughout its shop data.

🗄️ Supabase Database

The repository contains:

supabase/schema.sql

The schema defines:

•	`products`
•	`sales`
•	`expenses`
•	`customer_debts`
•	`audit_logs`
•	`background_events`

It also enables Row Level Security and provides policies for authenticated access.

Applying the schema

1.	Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Configure `.env.local`.
5. Create users through Supabase Authentication.
6. Add user metadata such as:

{
  "full_name": "Store Owner",
  "role": "owner"
}

or:

{
  "full_name": "Shop Staff",
  "role": "staff"
}

Important production security consideration

Frontend role checks should not be the only authorization mechanism.

For production, role-specific permissions should be enforced at the database/API layer using appropriate Row Level Security policies and server-side validation.

📐 Business Rules

Sales

When a sale is recorded:

2.	The product must exist.
2. Requested quantity cannot exceed stock.
3. The total is calculated from product pricing.
4. Inventory is reduced.
5. The sale is added to history.
6. An audit entry is created.
7. A low-stock event may be generated.

Expenses

An expense must have a positive amount.

Expenses meeting the large-expense threshold can generate a background event.

Customer debts

A debt must contain:
•	Customer name.
•	Customer phone.
•	Positive amount owed.

Unpaid debts reaching the aging threshold can generate a background event.

Editing and deletion

Sales, expenses, and customer debts support auditable changes.

Deletion uses:

isDeleted: true

rather than immediately destroying the historical record.

🧪 Demo Data

The local/demo engine includes sample Nigerian retail products such as:

•	Bag of Rice (50kg)
•	Vegetable Oil (5L)
•	Carton of Noodles (Indomie)
•	Sugar (50kg)
•	Tomato Paste (Pack of 50)
•	Refined Milk (Pack of 24)

🌐 Deployment

The application can be deployed as a Vite frontend on platforms such as Vercel.

Typical deployment flow:

3.	Push the repository to GitHub.
2. Import the repository into the hosting platform.
3. Use the Vite build configuration.
4. Add Supabase environment variables if using hosted authentication/data.
5. Deploy.

Production build:

npm run build

⚠️ Current Limitations

The current implementation should be understood as a strong prototype/local-first application rather than a finished multi-tenant production platform.

Data layer

Operational data currently uses browser `localStorage` in the frontend data context.

This means:
•	Data is tied to the browser/device.
•	Different devices do not automatically share data.
•	Clearing browser storage can remove local records.
•	Concurrent multi-user updates are not coordinated.

Authentication

The local/demo authentication path is not suitable for production security.

Database integration

The Supabase schema and authentication scaffolding exist, but the operational frontend data flow should be fully migrated to Supabase queries/RPCs before relying on it as the production source of truth.

🚀 Recommended Production Improvements

Before using the application as a production multi-user shop management system:

4.	Move operational data from `localStorage` to Supabase/PostgreSQL.
2. Use database transactions/RPCs for sale + inventory updates.
3. Enforce owner/staff permissions with RLS.
4. Replace demo authentication with fully configured Supabase Auth.
5. Validate business-critical operations server-side.
6. Prevent client-side manipulation of prices, stock, roles, and audit records.
7. Add automated unit/integration tests.
8. Add error monitoring and structured logging.
9. Add pagination for large histories.
10. Add database indexes for frequently queried fields.
11. Introduce database migrations for schema evolution.
12. Consider scheduled processing for aging-debt detection.

🤝 Contributing

5.	Fork the repository.
2. Create a feature branch:

git checkout -b feature/your-feature

3. Make your changes.
4. Run:

npm run lint
npm run build

5. Commit:

git commit -m "feat: describe your change"

6. Push:

git push origin feature/your-feature

7. Open a pull request.

📄 License

No license file is currently included in the repository.

If this project is intended for public reuse, add an appropriate `LICENSE` file and update this section.

👤 Project Summary

Shop App is a small-business operations and record-management application focused on helping shop owners and staff maintain accurate records of sales, inventory, expenses, and customer debts.

Its current architecture intentionally balances ease of local development with a path toward Supabase-backed multi-user deployment.

The most important design principle is that the application should not merely store information; it should help the shop maintain consistency, visibility, and accountability around everyday business operations.

Repository: `phebiannwokeji-cmd/Shop-App`


