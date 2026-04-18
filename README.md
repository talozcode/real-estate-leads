# Real Estate Lead Intake App

An internal web form for sales staff to capture customer leads and save them directly to a Google Sheet.

---

## What it does

- Staff fill out a lead form in the browser
- On submit, the data is saved as a new row in your Google Sheet
- A success screen shows the auto-generated Lead ID
- An `/admin` page lets you view all leads in a table

---

## Architecture (simple version)

```
Browser form  →  /api/submit (Next.js server route)  →  Google Sheets API
                       ↕
                  Validates input
                  Rate-limits by IP
                  Writes one row
```

Credentials **never leave the server**. The browser only talks to your own `/api` routes.

---

## Step 1 — Google Cloud Setup

### 1.1 Create a Google Cloud project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Give it a name (e.g. "Real Estate Leads") → **Create**

### 1.2 Enable the Google Sheets API

1. In the left sidebar: **APIs & Services → Library**
2. Search for **Google Sheets API** → click it → **Enable**

### 1.3 Create a Service Account

A service account is like a robot user that your app logs in as.

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Name it (e.g. `leads-app`) → **Create and Continue**
4. Skip the optional steps → **Done**

### 1.4 Download the JSON key file

1. Click on the service account you just created
2. Go to the **Keys** tab → **Add Key → Create new key**
3. Choose **JSON** → **Create**
4. A `.json` file is downloaded — **keep this safe and never commit it to git**

### 1.5 Create your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) → create a new blank spreadsheet
2. Name it anything (e.g. "Real Estate Leads")
3. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
   ```

### 1.6 Share the Sheet with your service account

1. Open the downloaded JSON key file in a text editor
2. Find the `"client_email"` field — it looks like:
   ```
   leads-app@your-project-12345.iam.gserviceaccount.com
   ```
3. In Google Sheets, click **Share** (top right)
4. Paste that email address → set role to **Editor** → **Share**

The app can now write to the sheet.

---

## Step 2 — Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the three values from your JSON key file:

| Variable | Where to find it |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The `client_email` field in the JSON file |
| `GOOGLE_PRIVATE_KEY` | The `private_key` field in the JSON file |
| `GOOGLE_SHEET_ID` | From the Google Sheet URL (see Step 1.5) |

**Important for `GOOGLE_PRIVATE_KEY`:**
- Copy the entire value including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
- Keep all the `\n` characters exactly as they appear in the JSON file
- Wrap the whole thing in double quotes in your `.env.local`

Example `.env.local`:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=leads-app@my-project-12345.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIB...rest of key...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

---

## Step 3 — Run Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the lead form.

Open [http://localhost:3000/admin](http://localhost:3000/admin) to view submitted leads.

---

## Step 4 — Deploy to Vercel (Recommended — Free)

Vercel is the easiest way to deploy a Next.js app.

1. Push your project to GitHub (make sure `.env.local` is in `.gitignore`)
2. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
3. Click **New Project** → import your repository
4. In the **Environment Variables** section, add all three variables from your `.env.local`
5. Click **Deploy**

Your app will be live at a URL like `https://real-estate-leads.vercel.app`.

### Alternative: Deploy with Docker or a VPS

```bash
npm run build
npm start
```

The app runs on port 3000. Put it behind nginx or Caddy for HTTPS.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Main lead intake form (home page)
│   ├── admin/page.tsx        ← Admin table view of all leads
│   ├── api/
│   │   ├── submit/route.ts   ← Handles form submission → writes to Sheets
│   │   └── leads/route.ts    ← Reads all leads from Sheets (for admin page)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── LeadForm.tsx          ← The big form component
│   └── SuccessState.tsx      ← Success screen after submission
├── lib/
│   ├── google-sheets.ts      ← Google Sheets read/write logic
│   ├── validation.ts         ← Field validation (shared client + server)
│   └── rate-limit.ts         ← Basic spam protection
└── types/
    └── lead.ts               ← TypeScript types
```

---

## Google Sheet Column Layout

The first row will be auto-created with these headers on the first submission:

| Column | Data |
|---|---|
| A | Lead ID |
| B | Submitted At |
| C | Full Name |
| D | Phone |
| E | Email |
| F | Contact Method |
| G | Nationality |
| H | Intent |
| I | Property Type |
| J | Preferred Location |
| K | Budget |
| L | Bedrooms |
| M | Timeline |
| N | Lead Source |
| O | Assigned Agent |
| P | Notes |
| Q | Consent Given |

---

## Spam Protection

Each IP address is limited to **5 submissions per 10 minutes**. Extra submissions get a `429 Too Many Requests` response with a wait time.

For a production deployment with multiple servers, replace the in-memory store in `src/lib/rate-limit.ts` with a Redis store.

---

## Troubleshooting

**"Missing Google credentials" error**
→ Check that `.env.local` exists and all three variables are set correctly.

**"The caller does not have permission" error from Google**
→ You forgot to share the Google Sheet with the service account email (Step 1.6).

**The private key isn't working**
→ Make sure you kept the `\n` characters inside the key value, and that the whole value is in double quotes.

**Submissions aren't appearing in the sheet**
→ Check that the Sheet ID is correct (just the ID, not the full URL).
