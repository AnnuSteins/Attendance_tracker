 Student Attendance Tracker

A full-stack web application to manage students and track daily attendance with role-based access for Admin and Teacher.

---

## 🗂️ Project Structure

```
attendance-tracker/
├── server/                           
│   ├── config/
│   │   └── db.js                     
│   ├── controllers/
│   │   ├── authController.js         
│   │   ├── teacherController.js      
│   │   ├── studentController.js      
│   │   └── attendanceController.js  
│   ├── middleware/
│   │   └── authMiddleware.js         
│   ├── models/
│   │   ├── User.js                 
│   │   ├── Student.js             
│   │   └── Attendance.js         
│   ├── routes/
│   │   ├── authRoutes.js            
│   │   ├── teacherRoutes.js          
│   │   ├── studentRoutes.js         
│   │   └── attendanceRoutes.js       
│   ├── server.js                   
│   ├── seed.js                      
│   ├── .env                      
│   └── package.json
│
├── client/
│   ├── index.html                   
│   ├── style.css                    
│   └── app.js                        
│
└── README.md
```


## 🚀 Setup Instructions (Step by Step)

### Step 1 — Open the project in VS Code
```
Open VS Code → File → Open Folder → select the attendance-tracker/ folder
```

---

### Step 2 — Fix PowerShell execution policy (Windows only)

If you get this error when running any npm command:
```
npm : File cannot be loaded because running scripts is disabled on this system.
```

**Fix it in 3 steps:**
1. Search for **PowerShell** in the Windows search bar
2. Right-click it → **Run as Administrator**
3. Run this command and type `Y` when asked:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Close PowerShell, then close and reopen VS Code.

> **Easier alternative:** In VS Code, click the dropdown arrow `∨` next to
> the `+` in the terminal panel and choose **Command Prompt** instead of
> PowerShell. Command Prompt never has this restriction.

---

### Step 3 — Install backend dependencies

Open the VS Code terminal (`Ctrl + ~`) and run:
```bash
cd server
npm install
```
This downloads and installs all required packages:
`express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`, `nodemon`

> ⚠️ Always make sure your terminal is inside the `server/` folder.
> Your terminal path should show: `...\attendance-tracker\server>`
> If it shows `...\attendance-tracker>` run `cd server` first.

---

### Step 4 — Start MongoDB

MongoDB must be running before you can start the server or run seed.js.

#### Method 1 — Check if MongoDB is already running as a Windows Service

When you install MongoDB on Windows, it installs itself as a background
service that can start automatically. Check this first before doing anything else:

1. Press `Windows + R` on your keyboard
2. Type `services.msc` and press Enter
3. A list of Windows services opens — scroll down to find **MongoDB Server**
4. Look at the **Status** column next to it:

| Status             | What to do |
|--------|-----------|
| **Running**        | ✅ MongoDB is already running — skip to Step 5 |
| **Stopped**        | Right-click → click **Start** → wait a moment → skip to Step 5 |
| **Not in list**    | MongoDB is not installed — follow Method 2 below |

#### Method 2 — Install MongoDB (if not installed)

1. Go to: https://www.mongodb.com/try/download/community
2. Select: **Version** = Latest, **Platform** = Windows, **Package** = MSI
3. Run the downloaded installer
4. Choose **Complete** installation (not Custom)
5. Keep all default settings and click through to **Install**
6. After installation, create the folder MongoDB uses to store data:
   ```bash
   mkdir C:\data\db
   ```
7. Add MongoDB to your system PATH so you can run `mongod` from any terminal:
   - Press `Windows + S` → search **"Edit the system environment variables"**
   - Click **Environment Variables** button at the bottom
   - Under **System variables** → find **Path** → click **Edit**
   - Click **New** → type exactly: `C:\Program Files\MongoDB\Server\7.0\bin`
     *(Replace 7.0 with your installed version if different)*
   - Click **OK** → **OK** → **OK**
8. Close VS Code completely and reopen it
9. Verify it works:
   ```bash
   mongod --version
   ```

#### Method 3 — Start MongoDB manually in a terminal

If MongoDB is installed but not running as a service, open a **new separate
terminal** (not the one you use for other commands) and run:
```bash
mongod
```
You should see a line that says:
```
waiting for connections on port 27017
```
**Keep this terminal open the entire time you use the app.**
If you close it, MongoDB stops and your app loses database connection.

---

### Step 5 — Create your Admin account

This only needs to be done **once** when setting up the project for the first time.

Make sure you are in the `server/` folder, then run:
```bash
node seed.js
```

You should see:
```
✅ Connected to MongoDB
✅ Admin user created successfully!
📧 Email:    admin@school.com
🔑 Password: admin123
```

> **If seed.js runs but shows nothing at all:**
> MongoDB is not connected. Go back to Step 4 and make sure MongoDB is running,
> then try again.

> **If it says "Admin already exists":**
> You already ran seed.js before. That is fine — move on to Step 6.

---

### Step 6 — Start the backend server

```bash
npm run dev
```

You should see:
```
[nodemon] starting `node server.js`
✅ Server is running on http://localhost:5000
✅ MongoDB connected successfully!
```

> **If nodemon is not recognized:**
> ```bash
> npm install -g nodemon
> ```
> Then run `npm run dev` again.
>
> **Alternative (without nodemon):**
> ```bash
> node server.js
> ```
> This works the same way. The only difference is you have to manually stop
> (`Ctrl + C`) and restart it whenever you make changes to the backend code.

---

### Step 7 — Open the frontend

Open `client/index.html` in your browser:

**Option A — Live Server (recommended):**
- Install the **Live Server** extension from the VS Code Extensions tab
- Right-click `index.html` in VS Code → **Open with Live Server**
- The app opens at `http://localhost:5500`

**Option B — Direct file open:**
- Double-click `index.html` in File Explorer
- The app opens as a local file in your browser

> ⚠️ Both the backend server (Step 6) and the browser page (Step 7)
> must be open at the same time for the app to work.

---

## 🔑 Default Login Credentials

After running `seed.js` in Step 5, use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin   | admin@school.com                    | admin123 |
| Teacher | *(created by Admin inside the app)* | *(set by Admin)* |

---

## 📡 API Endpoints Reference

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | /api/auth/register | Public     | Create a new user account |
| POST   | /api/auth/login    | Public     | Login and receive JWT token |
| GET    | /api/auth/me       | Protected  | Get currently logged-in user |

### Teachers — `/api/teachers`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | /api/teachers     | Admin only | Get all teachers |
| POST   | /api/teachers     | Admin only | Create a new teacher |
| PUT    | /api/teachers/:id | Admin only | Update teacher details |
| DELETE | /api/teachers/:id | Admin only | Delete a teacher |

### Students — `/api/students`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | /api/students     | Admin + Teacher | Get students (filtered by role) |
| POST   | /api/students     | Admin only      | Add a new student |
| PUT    | /api/students/:id | Admin only      | Update student details |
| DELETE | /api/students/:id | Admin only      | Delete a student |

### Attendance — `/api/attendance`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/attendance/mark       | Teacher only    | Mark attendance for a date |
| GET  | /api/attendance            | Admin + Teacher | View attendance records |
| GET  | /api/attendance/report/:id | Admin + Teacher | Full report for one student |

---

## 🗄️ Database Schema

### users collection
```
_id           → Auto-generated unique ID by MongoDB
name          → Full name (String, required)
email         → Email address (String, unique — no duplicates allowed)
password      → Encrypted by bcryptjs (plain text is never stored)
role          → Either "admin" or "teacher" — no other values allowed
createdAt     → Automatically added when document is created
updatedAt     → Automatically updated when document is changed
```

### students collection
```
_id             → Auto-generated unique ID
name            → Full name (String, required)
rollNumber      → Unique roll number (String, required, no duplicates)
className       → Class name e.g. "Class 10A" (String, required)
assignedTeacher → ID reference pointing to a User document (can be null)
createdAt       → Auto timestamp
```

### attendances collection
```
_id        → Auto-generated unique ID
student    → ID reference pointing to a Student document (required)
date       → Date of the attendance record (Date type, required)
status     → Either "Present" or "Absent" — no other values allowed
markedBy   → ID reference pointing to the User (teacher) who marked it

UNIQUE INDEX on (student + date)
→ MongoDB rejects duplicate attendance for same student on same date
→ Re-saving same date uses findOneAndUpdate with upsert to update instead
```

---

## 🔐 How Security Works

1. **Password Encryption** — bcryptjs scrambles passwords before saving. The original password is never stored anywhere. Even if the database is hacked, passwords cannot be read.

2. **JWT Token** — After login, the server creates a JSON Web Token containing the user's ID. This token is stored in the browser's localStorage and sent with every future request.

3. **Protected Routes** — Every API request except login must include the token in the HTTP header: `Authorization: Bearer <token>`

4. **Token Verification** — `authMiddleware.js` verifies the token on every protected request. Fake or expired tokens are rejected with HTTP 401 Unauthorized.

5. **Role-Based Access** — After verifying the token, middleware checks the user's role. Teachers hitting admin-only routes get HTTP 403 Forbidden.

6. **Data Isolation** — The student and attendance controllers check `req.user.role`. If the user is a teacher, queries are automatically filtered to only return their assigned students.

---

## 💡 How to Use the App

### As Admin:
1. Login with `admin@school.com` / `admin123`
2. **Teachers page** → Click **+ Add Teacher** → enter name, email, password → Save
3. **Students page** → Click **+ Add Student** → enter details and assign a teacher → Save
4. **Reports page** → Select any student from the dropdown → Click **View Report**

### As Teacher:
1. Login with the email and password the Admin created for you
2. **My Students** → View the list of students assigned to you
3. **Mark Attendance** → Select a date → Click **Load Students** → Mark each student Present or Absent → Click **Save Attendance**
4. **Reports** → Select one of your students → Click **View Report** to see their full attendance history and percentage

---

## 🛠️ Errors Encountered During Development & Their Fixes

These are real errors that came up while building and running this project:

---

### ❌ Error 1 — PowerShell blocks npm
```
npm : File cannot be loaded because running scripts is disabled on this system.
```
**Cause:** Windows PowerShell's execution policy blocks scripts by default.

**Fix:** Run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

### ❌ Error 2 — mongod not recognized
```
mongod : The term 'mongod' is not recognized as the name of a cmdlet
```
**Cause:** MongoDB is not installed or not added to system PATH.

**Full fix steps:**
1. Press `Windows + R` → type `services.msc` → Enter
2. Look for **MongoDB Server** in the services list
3. If **Running** → MongoDB works fine, no need to run `mongod` manually
4. If **Stopped** → right-click → **Start**
5. If **not listed** → MongoDB is not installed — follow Setup Step 4 above

---

### ❌ Error 3 — seed.js file not found
```
Error: Cannot find module '...\attendance-tracker\seed.js'
```
**Cause:** You ran `node seed.js` from the wrong folder. `seed.js` is inside `server/`.

**Fix:**
```bash
cd server
node seed.js
```

---

### ❌ Error 4 — seed.js shows no output
**Cause:** MongoDB is not running so the database connection fails silently.

**Fix:** Start MongoDB first (see Setup Step 4), then run `node seed.js` again.

---


## 🧰 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | HTML5        | —    | Page structure |
| Frontend | CSS3         | —    | Styling and layout |
| Frontend | JavaScript ES6+ | — | UI logic and API calls |
| Backend  | Node.js      | v18+ | JavaScript server runtime |
| Backend  | Express.js   | v4.18| REST API framework |
| Database | MongoDB      | v7.0 | NoSQL document database |
| ODM      | Mongoose     | v7.0 | MongoDB object modeling |
| Security | bcryptjs     | v2.4 | Password hashing |
| Security | jsonwebtoken | v9.0 | JWT token creation and verification |
| Dev Tool | nodemon      | v3.0 | Auto server restart on file save |

---

---

## 📌 Important Reminders

- **Run `seed.js` only once.** Running it again safely skips creation if admin already exists.
- **Both servers must run simultaneously** — backend on port `5000` and frontend via Live Server on port `5500`.
- **Always `cd server` first** before running any backend commands like `npm install`, `npm run dev`, or `node seed.js`.