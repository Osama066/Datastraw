# 🎟️ DataStraw Support CRM System

A full-stack, production-ready **Customer Support CRM System** built for the Datastraw hiring assignment. It handles ticket creations, lists support incidents with live search and multi-status filtering, tracks internal communication timelines, and supports quick updates in an elegant, glassmorphic dark-theme layout.

---

## 🚀 Key Features

* **Create Support Tickets**: A streamlined client intake form with validation checks.
* **List & Manage Incidents**: A modern datatable highlighting Ticket ID, Customer details, Issue, and Created Date.
* **Real-time KPI Dashboard**: High-fidelity counters showing Total, Open, In Progress, and Resolved ticket summaries, accompanied by a dynamic workspace completion rate tracker.
* **Instant Search & Filtering**: Multi-status tabs (Open, In Progress, Closed) and quick search-as-you-type querying that dynamically scans IDs, names, emails, and descriptions.
* **Activity & Notes Timeline**: chronological internal notes ledger associated with each ticket. Allows agents to update status and submit comments within a single unified view.
* **Resilient Port Allocation**: Built-in backend port scanner that automatically identifies available local ports (starting at `3010`) to prevent startup port-collision (`EADDRINUSE`) crashes.
* **Responsive Layout**: Native CSS glassmorphic aesthetics that scale beautifully across mobile, tablet, and widescreen layouts.

---

## 🛠️ Technology Stack

1. **Backend Service**: Node.js & Express (written as modern ES6 modules).
2. **Database Engine**: Relational SQLite (using the asynchronous wrapper `sqlite` along with the standard `sqlite3` driver).
3. **Frontend Application**: React 18 & Vite (for lightning-fast compilation and instant HMR updates).
4. **Style Foundation**: Tailwind CSS with custom theme styling (glassmorphism accents, glowing card backdrops, custom dark scrollbars).
5. **Icon Toolkit**: Lucide React.
6. **Task Runner**: Root-level orchestration utilizing `concurrently` to run both services together.

---

## 📂 Project Structure

```
datastraw_Assignment/
├── package.json                 # Root package.json (monorepo workspace runner)
├── .gitignore                   # Ignores database files, node_modules, build outputs
├── README.md                    # Detailed documentation (This file)
├── .env.example                 # Example configuration schema
├── backend/
│   ├── package.json             # Express dependencies & scripts
│   ├── server.js                # Core Express API router, database gateway, static server
│   ├── db.js                    # SQLite connector, schema builder, seed populate script
│   └── database.sqlite          # SQLite local data store (auto-created on startup)
└── frontend/
    ├── package.json             # React, Vite, Tailwind CSS configurations
    ├── vite.config.js           # Vite server settings & reverse API proxy
    ├── tailwind.config.js       # Custom glassmorphic styles, Outfit font, glow accents
    ├── postcss.config.js        # PostCSS directives
    ├── index.html               # Main mounting HTML, Google Font imports
    └── src/
        ├── main.jsx             # React entrypoint
        ├── index.css            # Global directives, CSS transitions, scrollbar overrides
        ├── App.jsx              # Workspace state engine, Navbar, toast alerts
        └── components/
            ├── DashboardStats.jsx   # KPI metric cards & completion rate trackers
            ├── TicketList.jsx       # Datatable search and category selector tabs
            ├── TicketCreateModal.jsx# Slide-over intake form panel with client-side validation
            └── TicketDetails.jsx    # Double-pane incident ticket inspector and timeline
```

---

## ⚡ Setup & Run Instructions

Ensure you have **Node.js (v18+)** and **NPM** installed.

### 1. Installation
In the root directory of the workspace, run the following command to download all dependencies for the root orchestrator, Express server, and Vite React client:

```bash
npm run install:all
```

*(Alternatively, you can run `npm install` in the root, `backend/`, and `frontend/` folders manually).*

### 2. Run in Development Mode
To launch the frontend dev server and the backend server concurrently with a single terminal command:

```bash
npm run dev
```

* **Frontend Dev Server**: Runs on `http://localhost:3000` (proxies `/api/*` to backend).
* **Backend Dev API**: Runs on `http://localhost:3010` (or the next available port).

### 3. Build & Run in Production Mode
To compile the frontend client into optimized production bundles and launch the single Express server hosting both the REST endpoints and the client assets:

```bash
# 1. Build the frontend
npm run build

# 2. Run the production server
npm start
```

The app will compile and start listening. If port `3010` is occupied, it will automatically scan upwards to find an open port (e.g. `3011`), avoiding any system launch conflicts!

---

## 📡 REST API Documentation

### `POST /api/tickets`
Creates a new support ticket in the database.
* **Body**:
  ```json
  {
    "customer_name": "Sarah Jenkins",
    "customer_email": "sarah.j@example.com",
    "subject": "Unable to log in",
    "description": "Hi Support, I am seeing a 500 error on loading..."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "ticket_id": "TKT-1004",
    "created_at": "2026-05-30T13:00:00.000Z"
  }
  ```

### `GET /api/tickets`
Retrieves a filtered, sorted list of all support tickets.
* **Query Parameters (Optional)**:
  * `status`: Filter by status (`Open`, `In Progress`, `Closed`).
  * `search`: Term to perform quick search matches across names, emails, subject lines, descriptions, and ticket IDs.
* **Response (200 OK)**:
  ```json
  [
    {
      "ticket_id": "TKT-1002",
      "customer_name": "Alex Rivera",
      "subject": "Webhook verification failures",
      "status": "In Progress",
      "created_at": "2026-05-29T20:10:00.000Z"
    }
  ]
  ```

### `GET /api/tickets/{ticket_id}`
Retrieves details of a single ticket along with its complete chronological timeline of internal staff notes.
* **Response (200 OK)**:
  ```json
  {
    "ticket_id": "TKT-1002",
    "customer_name": "Alex Rivera",
    "customer_email": "alex.rivera@techcorp.io",
    "subject": "Webhook verification failures",
    "description": "We are experiencing failure in verifying the signatures...",
    "status": "In Progress",
    "created_at": "2026-05-29T20:10:00.000Z",
    "updated_at": "2026-05-30T11:45:00.000Z",
    "notes": [
      {
        "note_text": "Replied to customer: Verified no public key rotations...",
        "created_at": "2026-05-30T11:45:00.000Z"
      }
    ]
  }
  ```

### `PUT /api/tickets/{ticket_id}`
Updates a ticket's status and/or inserts a new internal activity comment in a single operation.
* **Body**:
  ```json
  {
    "status": "Closed",
    "notes": "Verified billing reversal has completed. Closing incident."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "updated_at": "2026-05-30T13:10:00.000Z"
  }
  ```

---

## ☁️ Deployment Guidelines

Since the backend is a standard Express + SQLite app that compiles and serves the React client bundle automatically, deployment is extremely straightforward!

### Option 1: Render.com (Recommended)
1. Fork / push your repository to GitHub.
2. In the Render Dashboard, click **New > Web Service**.
3. Link your repository.
4. Set the following configurations:
   * **Runtime**: `Node`
   * **Build Command**: `npm run install:all && npm run build`
   * **Start Command**: `npm start`
5. Render will automatically deploy, create the local SQLite store, and publish your URL!

### Option 2: Railway.app
1. Create a new project in Railway.
2. Link your GitHub repository.
3. Railway automatically detects the root `package.json`. It will run the default build and start commands seamlessly.
