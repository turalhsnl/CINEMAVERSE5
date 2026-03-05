# CinemaVerse

Full-stack movie discovery platform with MetaMask auth + TMDB.

---

## 🌐 Web App Setup

```bash
cd apps/web
npm install
npm run dev
```
Open → http://localhost:3000

**Requirements:** Node.js 18+ (https://nodejs.org)

---

## 📱 Mobile App Setup

```bash
cd apps/mobile
npm install
npx expo start
```
Scan QR code with **Expo Go** app on your phone.

**Requirements:** Node.js 18+, Expo Go app on phone

---

## 🔐 MetaMask Auth Flow

1. Click **Connect Wallet** in the navbar
2. MetaMask popup opens → approve connection
3. MetaMask asks you to **sign a message** (no gas fee)
4. **New wallet?** → Registration form appears → enter username → done
5. **Existing wallet?** → Logged in instantly

Wallet data is saved in your browser's localStorage (no backend needed for demo).

---

## 📁 Project Structure

```
cinemaverse/
├── apps/
│   ├── web/       ← Next.js 14 + Tailwind + Framer Motion
│   └── mobile/    ← Expo SDK 54 + Expo Router
└── README.md
```
