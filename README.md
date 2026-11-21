# 🛫 LugTrac — Smart Airport Luggage Tracking System

LugTrac is an end-to-end IoT-integrated airport luggage tracking platform with a **Spring Boot** backend, a **React** web dashboard, and a **React Native (Expo)** mobile app. Passengers can register bags via RFID tags, monitor live checkpoint locations, receive tamper alerts, toggle smart security locks, and manage baggage photos.

---

## ✨ Features

* **Authentication & Security:** JWT-based login, registration, and 6-digit email OTP password reset.
* **Baggage CRUD & Media Management:** Register, edit, and delete luggage records with Cloudinary photo upload and automatic cloud cleanup on delete/update.
* **Real-Time Tracking & Mapping:** Checkpoint-based transit timeline and interactive OpenStreetMap/Leaflet maps (zero API key required) on both web and mobile.
* **IoT Hardware Integration:** Remote Smart Lock arming/disarming, tamper breach alerts, weight readings, and battery diagnostics.

---

## 🗂️ Repository Structure

```text
LugTrac/
├── lugtrac-backend/    # Spring Boot REST API, JWT Security, Cloudinary, JPA
├── lugtrac-frontend/   # React Web Dashboard (Leaflet Maps, Axios)
└── lugtrac-mobile/     # React Native / Expo Mobile App (WebView Leaflet, Image Picker)