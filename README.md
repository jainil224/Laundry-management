# 🧺 Laundrify - Hostel Clothes Management & Laundry System

A modern, mobile-first web application designed for hostel students to manage their wardrobe, track laundry wash cycles, filter garments by categories, and monitor collection history with ease.

---

## ✨ Features & Functionality

### 👔 Wardrobe Management
- **Smart Category Filtering**: Quick filter chips for *T-Shirts*, *Shirts*, *Pants & Jeans*, *Shorts*, *Undergarments*, *Towels & Bedding*, *Jacket*, *Blanket*, *Pillow Cover*, and *Track Pants & Suits*.
- **Live Camera & AI Garment Focus**: 
  - Direct in-app camera viewfinder with real-time AI Cloth Outline / Bounding Box scanner (`AI OUTLINE ON/OFF`).
  - Tap-to-focus reticle and camera flip support.
  - Native file picker fallback for camera/gallery.
- **Glassmorphism Visual Cards**: Sleek category badges, status indicators (`IN WASH`, `READY`), and photo action buttons.

### 🧺 Laundry Wash Submission
- **Batch Grouping**: Select multiple clothes to submit as a single laundry batch.
- **Real-time Status Tracking**: Monitor active wash requests and batch collection status in real-time.

### 📜 Activity & History Management
- **Unified Activity History**: Grouped batches displaying submission timestamps, days of the week, dates, and item photo grids.
- **Month & Date Sorting**: Filter history records by month or sort by newest/oldest.
- **Granular Deletion**: Remove individual history items or clear all history records with confirmation.

### 👤 Profile & Room Configuration
- **Room Details Setup**: Manage your Name, Room Number, and **Floor Number**.
- **Firebase Auth Integration**: Synchronized live authentication (Google Sign-In & Email/Password options).

---

## 🛠️ Technology Stack

- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Motion (Framer Motion)
- **Backend / Storage**: Firebase Auth & Firestore / Cloudinary Image Sync

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone or navigate to project directory
cd clothes-mana

# Install dependencies
npm install

# Run dev server
npm run dev

# Run TypeScript / Lint check
npm run lint
```

---

<div align="center">

### Made with ❤️ by **Jainil Patel**

*Building clean solutions for everyday problems.*

</div>
