# SecureGallery - Secure Multimedia Gallery

A complete web application for managing image galleries with integrated automatic steganography detection, secure authentication, and user role system.

## Table of Contents

1. [What is SecureGallery?](#what-is-securegallery)
2. [How Does It Work?](#how-does-it-work)
3. [Main Components](#main-components)
4. [Prerequisites](#prerequisites)
5. [Step-by-Step Installation](#step-by-step-installation)
6. [Getting Started](#getting-started)
7. [Detailed Operation](#detailed-operation)
8. [Project Structure](#project-structure)
9. [Frequently Asked Questions](#frequently-asked-questions)

---

## What is SecureGallery?

SecureGallery is a web platform that allows:

- **Gallery Management** - Create, edit, and organize photo albums
- **Secure Authentication** - Each user has their own protected account
- **Steganography Detection** - Automatically analyzes if images contain hidden information
- **User Roles** - Normal users, supervisors, and administrators with different permissions
- **Image Quarantine** - Automatically isolates suspicious images
- **Public Gallery** - Share your public albums with others

### Key Concepts

**What is Steganography?**
It is the technique of hiding information within files (such as images). For example, someone could hide a text file inside a photo without it being noticeable at first glance.

**Why is it important?**
In security contexts, it is important to detect if someone is trying to sneak hidden information into the images you upload.

---

## How Does It Work?

### General Flow

```
User                 Browser              Backend                Database
  |                    |                     |                       |
  |--- Register ------>|                     |                       |
  |                    |--- POST /register ->|--- Save user -------->|
  |<--- Confirmation ---|<--- JWT Token -----|                       |
  |                    |                     |                       |
  |--- Login --------->|                     |                       |
  |                    |--- POST /login ---->|--- Verify credentials |
  |<--- JWT Token ------|<--- JWT Token -----|                       |
  |                    |                     |                       |
  |--- Upload image -->|                     |                       |
  |                    |--- POST /upload --->|--- Save file -------->|
  |                    |                     |--- Analyze image --->|
  |                    |                     |--- Save result ------>|
  |<--- Result ---------|<--- Image Status---|<--- Analysis Status---|
```

### Step by Step: What Happens When You Upload an Image?

1. **Upload** - You select an image in the browser
2. **Sending** - The image is sent to the backend server
3. **Storage** - It is saved in the `uploads/` folder
4. **Analysis** - The backend runs steganography detection algorithms
5. **Result** - It is saved as either "CLEAN" or "SUSPICIOUS"
6. **Quarantine** - If suspicious, it is automatically isolated
7. **Notification** - You see the result in the gallery

---

## Main Components

### 1. Backend (Python + FastAPI)

**What is it?** It is the "brain" of the application that runs on the server.

**What does it do?**
- Manages users and authentication
- Processes uploaded images
- Performs steganography analysis
- Stores data in the database
- Provides REST APIs for the frontend to use

**Location:** `/backend/`

### 2. Frontend (React + Vite + TypeScript)

**What is it?** It is the visual interface you see in the browser.

**What does it do?**
- Displays login/registration forms
- Allows image uploads
- Shows the gallery with results
- Communicates with the backend

**Location:** `/frontend/`

### 3. Database (PostgreSQL)

**What is it?** Stores all information in an organized manner.

**What does it store?**
- User information
- Album details
- Image information
- Analysis results

---

## Prerequisites

Before starting, you need to have installed:

### 1. Python 3.8+
Programming language for the backend.
- [Download Python](https://www.python.org/downloads/)
- **Verify installation:**
  ```bash
  python --version
  ```

### 2. Node.js 16+
Environment for running JavaScript/TypeScript from the frontend.
- [Download Node.js](https://nodejs.org/)
- **Verify installation:**
  ```bash
  node --version
  npm --version
  ```

### 3. PostgreSQL 12+
Database where all data is stored.
- [Download PostgreSQL](https://www.postgresql.org/download/)
- **Verify installation:**
  ```bash
  psql --version
  ```

### 4. Git (Optional but recommended)
To clone the repository.
- [Download Git](https://git-scm.com/downloads)

---

## Step-by-Step Installation

### STEP 1: Download the Project

**Option A: With Git (Recommended)**
```bash
git clone https://github.com/BrayanJac/esteganografia_galeria.git
cd esteganografia_galeria
```

**Option B: Manual download**
1. Go to: https://github.com/BrayanJac/esteganografia_galeria
2. Click "Code" → "Download ZIP"
3. Extract the folder

---

### STEP 2: Configure Database

#### 2.1 Create the database

Open pgAdmin (PostgreSQL graphical interface) or the terminal:

```bash
# Open PostgreSQL terminal
psql -U postgres

# In the PostgreSQL terminal, type:
CREATE DATABASE secure_gallery;
\q
```

#### 2.2 Verify connection

```bash
psql -U postgres -d secure_gallery -c "SELECT 1;"
# Should show: 1
```

---

### STEP 3: Install Backend

#### 3.1 Enter the backend folder
```bash
cd backend
```

#### 3.2 Create virtual environment
An "isolated environment" for Python dependencies.

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On Mac/Linux
python -m venv venv
source venv/bin/activate
```

#### 3.3 Install dependencies
```bash
python3 -m pip install -r requirements.txt
```

#### 3.4 Configure environment variables
```bash
# Copy example file
cp .env.example .env
```

Open the `.env` file with a text editor and edit:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost/secure_gallery
SECRET_KEY=change-this-to-a-secure-long-key
```

#### 3.5 Create database tables
```bash
python -c "from database.database import create_tables; create_tables()"
```

#### 3.6 Start the backend
```bash
python main.py
```

**What should you see?**
```
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Important!** Keep this terminal open while working.

---

### STEP 4: Install Frontend

#### 4.1 Open ANOTHER terminal and enter the frontend folder
```bash
cd frontend
```

#### 4.2 Install dependencies
```bash
npm install
```

#### 4.3 Start the development server
```bash
npm run dev
```

**What should you see?**
```
➜  Local:   http://localhost:5173/
```

#### 4.4 Open in browser
Open your favorite browser and go to:
```
http://localhost:5173
```

---

## Getting Started

### 1. Register

1. On the home page, click **"Register"**
2. Complete the form:
   - **Username:** Your username (e.g., "juan123")
   - **Email:** Your email (e.g., "juan@example.com")
   - **Password:** Minimum 12 characters, including:
     - Uppercase (A-Z)
     - Lowercase (a-z)
     - Numbers (0-9)
     - Special characters (!@#$%^&*)
   - Valid example: `MyPassword@123!`

3. Click **"Register"**

### 2. Login

1. Click **"Login"**
2. Enter your username and password
3. Click **"Login"**

### 3. Create an Album

1. Once inside, go to **"My Gallery"**
2. Click **"New Album"**
3. Fill in:
   - **Title:** Album name (e.g., "Vacation 2024")
   - **Description:** Optional description
   - **Public:** Check if you want others to see it
4. Click **"Create"**

### 4. Upload Images

1. In your album, click **"Upload image"**
2. Select images from your computer
3. Wait for them to process
4. You will see the status: "Clean" or "Suspicious"

---

## Detailed Operation

### Authentication (Login/Register)

```
1. Registration:
   User ----[name, email, password]--> Backend
   Backend: "I will encrypt the password"
   Backend: "I will save the user in the database"
   Frontend: "Done! Now login"

2. Login:
   User ----[username, password]--> Backend
   Backend: "Does the password match?"
   Backend: "Yes! Here is your TOKEN"
   Frontend: "I will save the TOKEN for future requests"

3. Future Requests:
   User wants to upload image
   Frontend: "I will attach the TOKEN to the request"
   Backend: "Has valid TOKEN?"
   Backend: "Yes! Allow upload"
```

**What is a TOKEN?**
It is like an access pass. Once you log in, the server gives you a pass that says "This user is trusted". Each time you do something, you show your pass.

### Image Analysis

```
User uploads image
    ↓
Backend receives the image
    ↓
Backend saves image in "uploads/" folder
    ↓
Backend runs analysis algorithms:
  - LSB Steganography (Least Significant Bit)
  - DCT Coefficients (Discrete Cosine Transform)
  - Fourier Analysis
    ↓
Backend calculates a "suspicion score"
    ↓
Score > 70%? → QUARANTINE (Suspicious)
Score < 30%? → CLEAN (Safe)
Score 30-70%? → REQUIRES REVIEW (Manual)
    ↓
Result is saved in the Database
    ↓
Frontend shows result to user
```

### Role Flow

```
NORMAL USER:
├── Create own albums
├── Upload images
├── View their gallery
└── View public galleries

SUPERVISOR:
├── Everything the user can do
├── Review quarantined images
├── Approve/Reject albums
└── View administration panel

ADMIN:
├── Everything the supervisor can do
├── Manage users
├── View statistics
└── Complete system access
```

---

## Project Structure

```
esteganografia_galeria/
│
├── backend/                          [REST API - Python]
│   ├── main.py                       Main file (run this)
│   ├── requirements.txt              Python dependencies
│   ├── .env                          Configuration variables
│   ├── config/
│   │   └── config.py                 App configuration
│   ├── database/
│   │   ├── database.py               Database connection
│   │   └── models.py                 Data structure
│   ├── routers/                      API endpoints
│   │   ├── auth_router.py            Login/Register
│   │   ├── album_router.py           Album management
│   │   ├── image_router.py           Image management
│   │   └── gallery_router.py         Public gallery
│   ├── services/                     Business logic
│   │   ├── auth_service.py
│   │   ├── album_service.py
│   │   ├── image_service.py
│   │   └── gallery_service.py
│   ├── security/                     Security
│   │   ├── auth.py                   JWT authentication
│   │   ├── middleware.py             CORS, headers
│   │   └── steganography.py          Steganography analysis
│   └── uploads/                      Saved images
│
├── frontend/                         [Interface - React]
│   ├── src/
│   │   ├── components/               React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ...
│   │   ├── pages/                    Full pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── GalleryPage.tsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.ts                HTTP client
│   │   ├── hooks/                    Custom hooks
│   │   ├── store/                    Global state
│   │   ├── types/                    TypeScript types
│   │   ├── App.tsx                   Root component
│   │   └── main.tsx                  Entry point
│   ├── package.json                  Node dependencies
│   ├── vite.config.ts                Vite configuration
│   └── .env                          Environment variables
│
└── README.md                         This file
```

---

## Security

### Implemented Security Features

| Feature | What is it? | Why? |
|---------|-----------|------|
| **JWT** | Secure authentication tokens | Prevents impersonation |
| **Argon2** | Password encryption | Passwords not stored in plain text |
| **Rate Limiting** | Limits login attempts | Prevents brute force attacks |
| **CORS** | Cross-origin control | Only authorized frontend can access |
| **HTTPS (production)** | Encrypted connection | Protects data in transit |
| **Security Headers** | HTTP security headers | Protects against common attacks |

---

## Useful Commands

### Backend
```bash
# Start server
python main.py

# View real-time logs
python main.py --reload

# Access API documentation
# Open in browser: http://localhost:8000/docs
```

### Frontend
```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# View build locally
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Common Problems and Solutions

### "Error connecting to database"

**Cause:** PostgreSQL is not running or incorrect credentials.

**Solution:**
```bash
# Verify PostgreSQL is running
# Windows: Search "Services" and ensure PostgreSQL is "Running"
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Verify credentials in .env
cat .env
```

### "Cannot GET /api/..."

**Cause:** Backend is not running.

**Solution:**
```bash
# Verify backend is running - terminal should show:
# "INFO:     Application startup complete"

# If not, start the backend:
cd backend
python main.py
```

### "CORS error"

**Cause:** Frontend and backend are not communicating correctly.

**Solution:**
```bash
# Verify in frontend .env:
VITE_API_URL=http://localhost:8000/api

# Restart both servers:
# Backend: Ctrl+C and python main.py
# Frontend: Ctrl+C and npm run dev
```

### "npm: command not found"

**Cause:** Node.js not installed or not in PATH.

**Solution:**
```bash
# Download and install Node.js from:
https://nodejs.org/

# Verify after:
node --version
npm --version
```

### "python: command not found"

**Cause:** Python not installed or not in PATH.

**Solution:**
```bash
# Download and install Python from:
https://www.python.org/downloads/

# On Windows: Check "Add Python to PATH" during installation

# Verify after:
python --version
```

---

## FAQ - Frequently Asked Questions

### How many images can I upload?
There is no defined limit. Maximum per image is 10MB (configurable).

### What image formats are supported?
JPG, PNG, GIF, BMP, WebP and other standard formats.

### Are images compressed?
No, they are stored in their original size.

### Can I change my password?
Yes, in the user panel (next version).

### What is "Quarantine"?
It is when an image is marked as suspicious by the analysis and is isolated. A supervisor must review if it really contains steganography.

### What is a "Role"?
It is the type of user. Each role has different permissions:
- **User:** Can create albums and upload images
- **Supervisor:** Can also review quarantined images
- **Admin:** Full system access

### Can I delete my account?
Not yet, but you can contact an admin.

### Are my data private?
Yes, each user only sees their own data, except public galleries.

### How long does steganography analysis take?
Typically 1-5 seconds depending on image size.

### Can I use the application offline?
No, it requires a connection because it uses a server.

---

## Additional Documentation

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Frontend README](./frontend/README.md) - Detailed frontend documentation
- [Frontend QUICKSTART](./frontend/QUICKSTART.md) - Frontend quick guide

---

## Contribution

Want to improve the project?

1. **Report errors** - If you find a bug, create an issue
2. **Suggest improvements** - Have ideas? We want to hear them
3. **Contribute code** - Fork and send a pull request

---

## License

This project is under MIT license. You are free to use, modify, and distribute it.

---

## Author

Developed by: **Brayan Jac**

---

## Acknowledgments

- FastAPI - Backend framework
- React - UI library
- PostgreSQL - Database
- Open source community

---

## Educational Notes

This project was created for **educational purposes** to learn:
- Full stack development
- Web application security
- Image processing
- Authentication and authorization
- Relational databases
- REST APIs

---

For questions or issues, please refer to the documentation or contact the development team.

Thank you for using SecureGallery!
