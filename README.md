# Hirewise (Optimizing Hiring Process with automated CV Screening and interview based assesment)

This is a full-stack project built with **React (Frontend)**, **Node.js/Express (Backend)**, and **Python**. It uses **Redis**, **MongoDB**, and **Docker** for a complete modern web application experience.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Docker
- Redis
- MongoDB

---

## 📁 Project Structure

```plaintext
project-root/
│
├── frontend/        # React frontend
├── backend/         # Node.js backend
└── python/          # Python service
```


---

## 🧪 Installation & Setup

### 1. Clone the Repository

```bash
git clone <>

## 🧪 Frontend Setup
cd frontend
npm install
npm run dev

## 🧪 Backend Setup
cd backend
npm install
npm run dev

## 🧪 Python Service Setup
cd ../python
pip install -r requirements.txt
python app.py

## 🧪 Redis Server Setup for BullMq Queue
docker run -p 5173:6379 redis


## Environment Variables
Create a .env file in the backend directory with the following:
MONGODB_URI=""
OPENAI_API_KEY=""
ACCESS_TOKEN_SECRET=""
REFRESH_TOKEN_SECRET=""
ACCESS_TOKEN_EXPIRY=""
REFRESH_TOKEN_EXPIRY=""
EMAIL_USER=""
EMAIL_PASS=""
TEST_TOKEN_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
FRONTEND_URL=""


✅ Features
⚛️ Modern React frontend (Vite)

🔗 RESTful API using Node.js & Express

🧠 Python service integration

🔐 JWT Authentication

🧰 Redis for caching

🐳 Dockerized Redis setup

☁️ Cloudinary integration

🗃️ MongoDB database







