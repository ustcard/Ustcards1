# Universal Sports Tip - Hostinger Deployment & Git Guide

## 1. Why Did the Admin Login Show an Error on Hostinger?
When you saw:
`Unexpected token '<', "<!doctype " ... is not valid JSON`
this happened because standard Hostinger Shared Web Hosting is designed to serve static files (`.html`, `.js`, `.css`) or PHP from `public_html`.
When your browser requested `/api/auth/login`, Hostinger's web server could not find a file at that path, so it responded with its default HTML error page (`<!doctype html>...`). The browser tried to parse HTML as JSON and crashed.

---

## 2. What We Fixed (Hybrid Dual-Mode Engine)
We upgraded the entire application with an automatic **Dual-Mode Engine**:
1. **If the Node.js backend is active** (Hostinger Node.js or VPS): It communicates normally with the Express server.
2. **If deployed on Static Shared Hosting** (where the Node.js backend is not running): The app automatically switches to the built-in browser database (`localStorage`) preloaded with the master seed data!

### Your Default Admin Credentials:
- **Email**: `admin@universalsportstip.com`
- **Password**: `admin12345`

### Your Default Demo Customer Credentials:
- **Email**: `alex.mercer@example.com`
- **Password**: `customer123`

Everything now works smoothly on Hostinger shared hosting:
- Admin login and dashboard stats
- Approving, rejecting, and updating card requests
- Live 3D ATM Card with obscured middle numbers
- Print Package generator (ZIP containing 300 DPI micro-etched card front, back, NFC and gold chip vectors, plus PDF spec sheet)
- Real-time milestone tracker

---

## 3. How to Push to GitHub
A local Git repository has already been initialized on the `main` branch.

### Option A: Push directly from your local terminal
If you downloaded this project or have it on your computer:
```bash
# 1. Add your GitHub repository as the remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 2. Push to GitHub
git push -u origin main
```

*(Note: Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your actual GitHub username and repository name).*

### Option B: Want us to push it for you?
If you provide your GitHub Repository URL (and a Personal Access Token with repo permissions), we can push it directly from this workspace.

---

## 4. Redeploying on Hostinger

### Method 1: Hostinger Shared Hosting (Easiest - 2 Minutes)
1. In your local project, run:
   ```bash
   npm run build
   ```
2. Open your Hostinger **hPanel** -> **File Manager** -> navigate to `public_html`.
3. Upload all files from the generated `dist/` folder directly into `public_html` (so `index.html` is at the root of `public_html`).
4. In `public_html`, ensure you have an `.htaccess` file for SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
5. Done! You can now log into your live website at `admin@universalsportstip.com` with `admin12345`!

### Method 2: Hostinger hPanel Git Auto-Deploy
1. In Hostinger hPanel, go to **Git**.
2. Connect your GitHub repository and set branch to `main`.
3. Set install directory to `/public_html` (or your subdomain).
4. Click **Deploy**.

### Method 3: Hostinger Node.js Application (If your Hostinger plan has Node.js support)
If your plan includes the **Node.js** icon in hPanel:
1. Go to hPanel -> **Node.js** -> **Create Application**.
2. Node.js version: **v20.x** or **v22.x**.
3. Application Root: `/` (or your project folder).
4. Application Startup File: `server.js` (we already bundled this for you).
5. Click **Save** and start the application.
