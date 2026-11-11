# System Architecture, Security & Deployment Documentation

## 1. Centralized Configuration & Persistence Model

All business data, layout controls, categories, products, deals, and gallery items are governed by the `StoreConfig` schema (`CURRENT_SCHEMA_VERSION = 2`) in `src/config/storeConfig.ts`.

- **Schema Migration (`migrateAndNormalizeConfig`)**: Automatically upgrades stored or imported JSON configurations to the current schema version while preserving any missing default keys for `headerConfig`, `footerConfig`, `headerElements`, `footerElements`, and `sectionVisibility`.
- **Configuration Validation (`validateStoreConfig`)**: Checks required business identity fields, 10-digit phone/WhatsApp formatting, 24-hour `HH:mm` time strings, and pharmacy compliance rules before export.
- **Local Browser Persistence vs. Live Static Hosting**:
  - Edits made in the Owner CMS are immediately persisted in the browser's `localStorage` (`shri_sai_store_config_v4`) so the shopkeeper can preview changes live.
  - Because static hosting providers (Vercel, Netlify, Cloudflare Pages, GitHub Pages) serve pre-built static bundles without a database backend, browser-local edits apply only to the local device until exported.
  - To publish changes globally to all website visitors: open **Owner CMS → 14. Export & Backup**, click **Copy TypeScript Code** or **Download storeConfig.ts**, replace `src/config/storeConfig.ts` in the repository, and trigger a production build (`npm run build`).

---

## 2. Security Architecture & Limitations

### Client-Side Hardening Implemented
1. **No Publicly Disclosed Default PIN**: The login screen never displays a default PIN in plaintext. On first access, the owner initializes a private 4–12 character secret PIN.
2. **PBKDF2-HMAC-SHA256 Key Derivation**: PINs are never stored in plaintext. The browser generates a 256-bit cryptographically random installation salt (`crypto.getRandomValues`) and derives a 256-bit hash using 100,000 iterations of PBKDF2-HMAC-SHA256 via the Web Crypto API (`crypto.subtle`).
3. **Progressive Rate Limiting**:
   - 4 failed attempts → 45-second lockout timer
   - 6+ failed attempts → 300-second (5-minute) lockout timer
4. **Session Expiry & Inactivity Lock**: Active CMS sessions are stored in `sessionStorage` with a 256-bit random token and automatically lock after 15 minutes of inactivity.
5. **Lockout Safeguard When Header Is Hidden**: If the owner hides the main header bar, a floating *Owner CMS* button and the `Ctrl + Shift + O` keyboard shortcut remain active so the owner is never locked out of the CMS.

### Client-Side vs. Server-Side Security Boundary
- PBKDF2 in a static single-page application acts as a **client-side local hardening mechanism** (protecting the CMS UI on a shared store counter computer).
- A static frontend application cannot enforce true server-side authorization. If multi-device remote database persistence is introduced in the future, authentication and authorization must be enforced on a backend server (e.g., HTTP-only session cookies, server-side RBAC, and database security rules).

---

## 3. Pharmacy Regulatory Compliance

1. **Prescription-Required (Rx) Indicators**: Restricted medicines display prominent `Rx Required` badges and a mandatory verification notice: *"Dispensed strictly upon verification of a valid doctor's prescription."*
2. **Enquiry-Based Workflow**: Products use direct WhatsApp availability and prescription verification enquiries rather than automated online checkout of restricted medicines.
3. **No Promotional Discounts on Rx Medicines**: Both the Flash Offer modal and `validateStoreConfig` strictly block promotional discounts from being applied to the *Prescription Medicines* category.
4. **No Medical Advice or Diagnosis**: The storefront provides factual store inventory and contact information without offering medical diagnosis or treatment recommendations.
