# Shri Sai Medical & General Store

> **Your Health, Our Priority** • *Your Trusted Neighbourhood Medical & General Store in Manipal*  
> Located at **Siddhesh Complex, Adarsha Nagar, Manipal, Karnataka – 576104**  
> Coordinates: **13°20'30.2"N 74°47'23.1"E**

---

## 📦 Complete Project Directory Structure

```text
shri-sai-medical/
├── index.html                 # HTML5 template with SEO & font imports
├── package.json               # Dependencies & deployment scripts
├── package-lock.json          # Locked dependency versions
├── vite.config.ts             # Vite configuration with relative base support
├── tailwind.config.js         # Tailwind theme & pharmacy color palette
├── postcss.config.js          # PostCSS configuration
├── tsconfig.json              # TypeScript compiler configuration
├── README.md                  # Project & deployment documentation
├── SYSTEM_DOCUMENTATION.md    # End-to-end architecture & technical audit
├── public/
│   └── favicon.svg            # Store icon / monogram
├── src/
│   ├── App.jsx                # Complete storefront & 14-tab Owner CMS
│   ├── main.tsx               # React 18 DOM mount entrypoint
│   ├── index.css              # Global styles & Tailwind directives
│   └── config/
│       └── storeConfig.ts     # TypeScript data interfaces & active seed config
```

---

## 🚀 How to Run Locally

### 1. Extract Files & Install Dependencies
Open your terminal in the project directory and run:

```bash
npm install
```

### 2. Start the Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 🔐 Owner CMS & Access Controls

- **Access Method 1**: Click the **Owner CMS** button in the header or footer.
- **Access Method 2 (Stealth Access)**: Press `Ctrl + Shift + O` (`Cmd + Shift + O` on macOS) anywhere on the page, or triple-click the store monogram logo.
- **Security PIN**: First-time initialization accepts `1234` or `8904`. You can change and encrypt your private PIN anytime in the **Security & PIN Shield** CMS tab.
- **Client-Side Security Notice**: Master PIN verification uses client-side PBKDF2-HMAC-SHA256 (100,000 iterations) and progressive rate limiting (45s lockout after 4 failed attempts, 5-minute lockout after 6 attempts) with 15-minute ephemeral session tokens. This protects the counter computer or tablet against walk-by inspection. For multi-device cloud synchronization over the public internet, attach a serverless API backend (e.g. Supabase, Firebase, or Cloudflare Workers).

---

## 🌐 100% Free Hosting & Deployment

### Option A: GitHub Pages
1. Push this folder to a GitHub repository named `shri-sai-medical`.
2. In `package.json`, set your URL:
   ```json
   "homepage": "https://<your-username>.github.io/shri-sai-medical"
   ```
3. Run:
   ```bash
   npm run deploy
   ```

### Option B: Cloudflare Pages or Vercel
1. Link your GitHub repository in the Cloudflare Pages or Vercel dashboard.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy! Free SSL and global edge CDN caching are provisioned automatically.

---

## 📞 Store Counter Details
- **Counter & Delivery Desk**: +91 89040 18698
- **Store & Enquiries**: +91 99452 27858
- **WhatsApp**: +91 89040 18698