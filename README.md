# 📮 Postal Life Insurance (PLI / RPLI) Birthday Automation System

Automatic Birthday Notification & Email System built for **Amulya Kumar Das & Sasmita Das (Postal Insurance Agents)**.

---

## 📁 Project Architecture

The project is cleanly split into **`frontend`** and **`backend`**:

```
pli/
├── frontend/                     # React 19 + Vite + Tailwind CSS Web App
│   ├── src/                      # Clean UI, Policy Form, Supabase Sync, Email Preview
│   ├── public/                   # India Post logos & static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── .env                      # Frontend Supabase & Resend API keys
│
├── backend/                      # Node.js + Express 6:00 AM Cron Automation
│   ├── index.js                  # Main server & 6:00 AM IST daily scheduler
│   ├── send-test-email.js        # Script to send on-demand test emails
│   ├── test-run.js               # Script to test the 6:00 AM logic immediately
│   ├── package.json
│   └── .env                      # Backend credentials & agent contact details
│
├── supabase/                     # Supabase schema & edge function
│   ├── supabase_schema.sql       # Single 'policyholders' table schema
│   └── functions/                # Deno Edge Function for cloud scheduling
│
├── .env                          # Master environment credentials
└── package.json                  # Root npm workspace orchestrator
```

---

## 🚀 How to Run

You can run everything conveniently from the project root:

### 1. Start Frontend (React UI)
```bash
npm run dev
```
Runs at: **`http://localhost:5173/`**

### 2. Start Backend (6:00 AM IST Automation Server)
```bash
npm run backend
```
Starts Express server on port `5000` with automatic 6:00 AM IST birthday scanning.

### 3. Send On-Demand Test Email
```bash
npm run test-email
```

### 4. Build for Production
```bash
npm run build
```
