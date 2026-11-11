# Shri Sai Medical & General Store — Official Website & Owner CMS

Production-ready React + TypeScript + Tailwind CSS web application for **Shri Sai Medical & General Store**, located at **Siddhesh Complex, Adarsha Nagar, Manipal, Karnataka 576104, India**.

---

## 1. Business Details

- **Store Name**: Shri Sai Medical & General Store
- **Address**: Siddhesh Complex, Adarsha Nagar, Manipal, Karnataka 576104, India
- **Opening Hours**: Open Every Day (Monday – Sunday), **7:30 AM – 11:00 PM IST**
- **Primary Phone**: `+91 89040 18698` (`8904018698`) — Counter & Delivery Desk
- **Secondary Phone**: `+91 99452 27858` (`9945227858`) — Store & Enquiries
- **WhatsApp Numbers**: `918904018698`, `919945227858`
- **Home Delivery**: Available across Adarsha Nagar & Manipal (configurable terms & coverage)

---

## 2. Project Architecture

```text
/
├── public/
│   └── favicon.svg                  # Official store monogram & medical cross SVG
├── src/
│   ├── config/
│   │   └── storeConfig.ts           # Single centralized source of truth & TypeScript interfaces
│   ├── utils/
│   │   ├── storeUtils.ts            # Pure IST clock, WhatsApp links, validation, migration & PBKDF2
│   │   └── storeUtils.test.ts       # Automated unit test suite (node:test)
│   ├── components/
│   │   ├── SafeImage.tsx            # Resilient image loader with pharmacy SVG fallback & Logo emblem
│   │   ├── HeaderAndTicker.tsx      # Announcement marquee, closed alert bar & configurable header
│   │   ├── StorefrontSections.tsx   # Hero, Flash Deals, About, Categories, Catalogue, Delivery, Gallery, Map, Footer
│   │   ├── OwnerCMS.tsx             # 14-tab Owner CMS + PBKDF2 PIN initialization & verification
│   │   └── Modals.tsx               # Add/Edit modals, Shopkeeper Easy Guide & Deployment Guide
│   ├── App.tsx                      # Root application state, persistence & security session manager
│   ├── main.tsx                     # React DOM entry point
│   └── index.css                    # Tailwind CSS + marquee keyframe animations
└── SYSTEM_DOCUMENTATION.md          # Complete architectural, security & deployment documentation
```

---

## 3. Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run automated unit tests
npx tsx --test src/utils/storeUtils.test.ts

# 3. Start local development server (Port 3000)
npm run dev

# 4. Type-check / lint
npm run lint

# 5. Build production bundle
npm run build
```

---

## 4. Managing the Store via the 14-Tab Owner CMS

Click **Owner CMS** in the top navigation bar (or press `Ctrl + Shift + O`, or triple-click the store logo) to open the Owner Dashboard:

1. **Sections & Layout**: Show/hide any of the 11 website sections, reorder header/footer elements, edit button labels, and toggle mobile/desktop visibility.
2. **Security & PIN**: Set or rotate your private Owner PIN (salted & hashed with 100,000 iterations of WebCrypto PBKDF2-HMAC-SHA256), view the security audit log, or revoke sessions.
3. **Store Profile**: Edit store name, tagline, subheadline, description, and business category badges.
4. **Contact & WhatsApp**: Update telephone numbers, labels, WhatsApp numbers, and default enquiry greeting.
5. **Location & Map**: Edit building, area, pincode, and Google Maps embed/directions URLs.
6. **Business Hours**: Configure opening/closing times in IST or set a manual override (*Automatic IST Clock*, *Force Open Now*, or *Force Closed*).
7. **Announcement Bar**: Toggle the top scrolling ticker, adjust scroll speed, and add/edit messages.
8. **Flash Deals**: Manage seasonal wellness & general store offers with an automatic discount price calculator and pharmacy compliance guard.
9. **Home Delivery**: Toggle home delivery status and manage coverage notes and terms.
10. **Categories**: Add, edit, or delete store departments.
11. **Products**: Add, edit, or delete catalogue items, toggle *In Stock* / *Ask for Availability* in 1 click, and toggle *Rx Required*.
12. **Store Gallery**: Upload photos directly from phone/computer (auto-resized via HTML5 Canvas) and assign them to Hero, About, or Gallery slots.
13. **Appearance**: Customize the store emblem (Initials, Medical Cross, ℞, ॐ, or Custom Image), shape, and border accent.
14. **Export & Backup**: Validate configuration, download/restore JSON backups, and generate `src/config/storeConfig.ts` for permanent static deployment.
