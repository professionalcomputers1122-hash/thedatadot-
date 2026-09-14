# The Data Dot — Production Deployment Guide

This guide outlines the production deployment pipeline for **The Data Dot**:

```
      GitHub
        ↓
      Vercel
        ↓
   TheDataDot.com

        And:

      Domain
        ↓
    Cloudflare (Proxy, SSL/TLS, DDoS)
        ↓
      Vercel
```

---

## 1. Push to GitHub

In your project directory, connect your local repository to your GitHub account:

```bash
# Rename branch to main
git branch -M main

# Add your GitHub repository as remote (replace with your actual GitHub repo URL)
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/thedatadot.git

# Push the codebase
git push -u origin main
```

---

## 2. Deploy on Vercel

1. Log in to [vercel.com](https://vercel.com) using your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select your `thedatadot` GitHub repository and click **"Import"**.
4. In the **Environment Variables** section, add the following 4 keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://trscauuhfkfhjhtamfvr.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your Supabase Anon Key |
| `RESEND_API_KEY` | `re_...` | Your Resend API Key |
| `SUPPORT_EMAIL` | `support@thedatadot.com` | Destination for support alerts |

5. Click **"Deploy"**. Vercel will build and assign an instant production URL (e.g., `thedatadot.vercel.app`).

---

## 3. Connect Custom Domain (`thedatadot.com`) in Vercel

1. In your Vercel project dashboard, go to **Settings** → **Domains**.
2. Add:
   - `thedatadot.com`
   - `www.thedatadot.com`
3. Vercel will show the target CNAME: `cname.vercel-dns.com` (or IP `76.76.21.21`).

---

## 4. Configure Cloudflare DNS & SSL

In your [Cloudflare Dashboard](https://dash.cloudflare.com) for `thedatadot.com`:

### A. DNS Records
Add or update the following records:

| Type | Name | Target / Content | Proxy Status | TTL |
| :--- | :--- | :--- | :--- | :--- |
| `CNAME` | `@` (root) | `cname.vercel-dns.com` | **Proxied (Orange Cloud)** | Auto |
| `CNAME` | `www` | `cname.vercel-dns.com` | **Proxied (Orange Cloud)** | Auto |

*(If your registrar does not support CNAME flattening on root, use an `A` record pointing `@` to `76.76.21.21` with Proxy ON).*

### B. SSL/TLS Settings
- Navigate to **SSL/TLS** → **Overview**.
- Set encryption mode to **Full (Strict)**. *(Avoid setting to "Flexible" as this causes redirect loops with Vercel).*
- Navigate to **SSL/TLS** → **Edge Certificates**:
  - **Always Use HTTPS**: `ON`
  - **Minimum TLS Version**: `TLS 1.2`
  - **Automatic HTTPS Rewrites**: `ON`

### C. Network & Optimization Settings
- Navigate to **Network**:
  - **WebSockets**: `ON` *(required for live Supabase real-time updates)*
- Navigate to **Speed** → **Optimization**:
  - Auto Minify: Leave `OFF` *(Next.js already handles minification)*
  - Rocket Loader: `OFF` *(can interfere with React hydration)*

---

## 5. Verification Checklist

- [x] All 41 Next.js routes compile with 0 errors
- [x] Live PostgreSQL tables connected via Supabase
- [x] Support emails dispatched via Resend
- [x] Cookie consent banner respects Necessary (ON), Analytics (OFF), Marketing (OFF)
- [x] Tenant-isolated security boundaries enforced
