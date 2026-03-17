// ================================================================
// app.js — ONLY JAVASCRIPT LOGIC LIVES HERE
// This file controls HOW everything BEHAVES.
//
// This file is loaded by index.html using:
// <script src="app.js"></script>
//
// It runs AFTER all HTML is loaded (because <script> is at the
// bottom of index.html body).
//
// WHAT THIS FILE DOES:
// 1. Stores the current app state (who is logged in, what data)
// 2. Makes API calls to the backend server
// 3. Shows/hides pages based on navigation
// 4. Fills tables and forms with data from the backend
// 5. Handles all button clicks and form submissions
// ================================================================


// ================================================================
// SECTION 1 — CONFIGURATION
// ================================================================

// The base URL of your backend server.
// Every API call starts with this URL.
// If you change the port in .env, update it here too.
const API_BASE = "http://localhost:5000/api";


// ================================================================
// SECTION 2 — STATE VARIABLES
// These variables hold data that the app needs to remember
// while it is running. They start empty and get filled after login.
// ================================================================

// Stores the logged-in user's info (name, email, role, token)
// null means nobody is logged in yet
let currentUser = null;

// Stores the list of teachers fetched from the backend
// Used to fill the "Assign Teacher" dropdown in the student form
let allTeachers = [];

// Stores the list of students fetched from the backend
// Used to fill the edit modal with existing student data
let allStudents = [];


// ================================================================
// SECTION 3 — API HELPER FUNCTION
//
// This is a reusable function that handles ALL communication
// with the backend. Instead of writing fetch() code every time,
// we call api() which does everything automatically:
// - Adds the login token to every request
// - Converts request data to JSON
// - Converts response from JSON back to JavaScript object
// - Throws an error if the server says something went wrong
// ================================================================

async function api(endpoint, method = "GET", body = null) {
  // ---- Step 1: Get the saved login token from browser storage ----
  // After login, we saved the token with localStorage.setItem("token", ...)
  // Now we retrieve it to attach to every request
  const token = localStorage.getItem("token");

  // ---- Step 2: Build the request options object ----
  // This object tells fetch() HOW to make the request
  const options = {
    method, // GET, POST, PUT, or DELETE

    headers: {
      // Tell the server we are sending JSON data
      "Content-Type": "application/json",

      // If a token exists, add it as Authorization header
      // The server reads this to know who is making the request
      // Syntax: "Bearer <token>"  ← this is the standard JWT format
      //
      // ...(condition ? {key:val} : {}) is the spread operator trick:
      // If token exists → spread { Authorization: "Bearer xyz" } into headers
      // If no token     → spread {} (empty, adds nothing)
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // ---- Step 3: If there's data to send (POST/PUT), add it as body ----
  // JSON.stringify() converts JavaScript object → JSON text string
  // fetch() requires the body to be a string, not an object
  if (body) {
    options.body = JSON.stringify(body);
  }

  // ---- Step 4: Make the actual HTTP request ----
  // fetch() contacts the server and waits for a response
  // We await it because it takes time (network request)
  const response = await fetch(`${API_BASE}${endpoint}`, options);

  // ---- Step 5: Convert the response from JSON text to JS object ----
  // The server sends back JSON text like: {"name":"Arjun","role":"teacher"}
  // .json() converts it to a real JS object we can use: data.name, data.role
  const data = await response.json();

  // ---- Step 6: Check if the request was successful ----
  // response.ok is true for status codes 200-299 (success)
  // response.ok is false for 400, 401, 404, 500 (errors)
  if (!response.ok) {
    // throw new Error() stops this function and jumps to the
    // nearest catch() block in whoever called api()
    // data.message is the error text sent from the backend
    throw new Error(data.message || "Something went wrong");
  }

  // ---- Step 7: Return the data to whoever called this function ----
  return data;
}


// ================================================================
// SECTION 4 — LOGIN & LOGOUT
// ================================================================

// Called when the user clicks the "Sign In" button
// Also called when user presses Enter in the password field
async function handleLogin() {

  // Read what the user typed in the email and password fields
  // .value gets the current text inside an input field
  // .trim() removes any accidental spaces at the start/end
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  // Get the div where we show error messages on the login page
  const alertBox = document.getElementById("login-alert");

  // Basic validation — don't even contact the server if fields are empty
  if (!email || !password) {
    // .innerHTML lets us write HTML into an element
    // We inject a styled error div
    alertBox.innerHTML = '<div class="alert alert-error">Please fill in all fields.</div>';
    return; // Stop the function here
  }

  // try...catch: try to run the code, catch any errors that happen
  try {
    // Call POST /api/auth/login with email and password
    // The backend checks them and returns user info + token
    const data = await api("/auth/login", "POST", { email, password });

    // --- Save login data to localStorage ---
    // localStorage persists even when the browser is closed and reopened
    // This is how "stay logged in" works

    // Save the token (used for future API requests)
    localStorage.setItem("token", data.token);

    // Save user info as a JSON string (we need it to know the role)
    // JSON.stringify() converts object → string because
    // localStorage can only store strings
    localStorage.setItem("user", JSON.stringify(data));

    // Store in our state variable for immediate use
    currentUser = data;

    // Clear any error messages
    alertBox.innerHTML = "";

    // Start the main app now
    initApp();

  } catch (error) {
    // If login failed, show the error message from the server
    alertBox.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  }
}


// Listen for "Enter" key press on the password field
// So user doesn't have to click the button — they can just press Enter
document.getElementById("login-password").addEventListener("keypress", function(e) {
  // e.key tells us which key was pressed
  if (e.key === "Enter") {
    handleLogin(); // Same as clicking the Sign In button
  }
});


// Called when the user clicks the "Logout" button in the navbar
function handleLogout() {

  // Remove saved login data from browser storage
  // After this, the user is treated as "not logged in"
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Clear the state variable
  currentUser = null;

  // Hide the main app
  document.getElementById("app").style.display = "none";

  // Show the login page again
  document.getElementById("login-page").style.display = "flex";

  // Clear the login form fields so the next person starts fresh
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
}


// ================================================================
// SECTION 5 — APP INITIALIZATION
// Runs once after successful login.
// Sets up the entire UI based on the user's role.
// ================================================================

function initApp() {

  // Hide login page — we don't need it anymore
  document.getElementById("login-page").style.display = "none";

  // Show the main app container
  document.getElementById("app").style.display = "block";

  // Show the user's name and role in the top-right of navbar
  // Template literal: `text ${variable} text` injects variable into string
  document.getElementById("nav-user-info").textContent =
    `${currentUser.name} (${currentUser.role})`;

  // Build the correct sidebar menu based on role
  buildSidebar();

  // Navigate to dashboard as the first page
  navigateTo("dashboard");
}


// ================================================================
// SECTION 6 — SIDEBAR BUILDER
// Creates different menu items for Admin vs Teacher
// ================================================================

function buildSidebar() {

  // Get the sidebar HTML element
  const sidebar = document.getElementById("sidebar");

  // Admin menu items — admin can do everything
  const adminMenu = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "teachers",  label: "👩‍🏫 Teachers" },
    { id: "students",  label: "👨‍🎓 Students" },
    { id: "reports",   label: "📈 Reports" },
  ];

  // Teacher menu items — teacher has limited access
  const teacherMenu = [
    { id: "dashboard",   label: "📊 Dashboard" },
    { id: "my-students", label: "👨‍🎓 My Students" },
    { id: "attendance",  label: "✅ Mark Attendance" },
    { id: "reports",     label: "📈 Reports" },
  ];

  // Choose menu based on the logged-in user's role
  // condition ? valueIfTrue : valueIfFalse  (ternary operator)
  const menu = currentUser.role === "admin" ? adminMenu : teacherMenu;

  // Build HTML for all menu items and inject into the sidebar
  //
  // .map() loops over the array and transforms each item into an HTML string
  // Each item becomes a <div> with:
  //   - class="menu-item" for styling
  //   - id="menu-{id}" so we can highlight the active one
  //   - onclick="navigateTo('{id}')" to navigate when clicked
  //
  // .join("") combines all the HTML strings into one big string
  sidebar.innerHTML = menu
    .map(item =>
      `<div class="menu-item" id="menu-${item.id}" onclick="navigateTo('${item.id}')">
        ${item.label}
      </div>`
    )
    .join("");
}


// ================================================================
// SECTION 7 — NAVIGATION
// Controls which page is shown and loads its data
// ================================================================

function navigateTo(pageId) {

  // ---- Step 1: Hide ALL pages ----
  // document.querySelectorAll() finds all elements matching the CSS selector
  // .forEach() loops through each one
  // .classList.remove("active") removes the "active" CSS class
  // Without "active", the CSS rule ".page { display: none }" hides it
  document.querySelectorAll(".page").forEach(function(p) {
    p.classList.remove("active");
  });

  // ---- Step 2: Remove highlight from ALL sidebar items ----
  document.querySelectorAll(".menu-item").forEach(function(m) {
    m.classList.remove("active");
  });

  // ---- Step 3: Show only the selected page ----
  // document.getElementById() finds a single element by its id
  const page = document.getElementById("page-" + pageId);
  if (page) {
    page.classList.add("active"); // CSS: ".page.active { display: block }"
  }

  // ---- Step 4: Highlight the clicked sidebar item ----
  const menuItem = document.getElementById("menu-" + pageId);
  if (menuItem) {
    menuItem.classList.add("active");
  }

  // ---- Step 5: Load data for the page that was just opened ----
  // Each page has its own load function that fetches data from backend
  if (pageId === "dashboard")   loadDashboard();
  if (pageId === "teachers")    loadTeachers();
  if (pageId === "students")    loadStudents();
  if (pageId === "my-students") loadMyStudents();
  if (pageId === "attendance")  loadAttendancePage();
  if (pageId === "reports")     loadReportsPage();
}


// ================================================================
// SECTION 8 — DASHBOARD PAGE
// Loads and displays the stat numbers
// ================================================================

async function loadDashboard() {
  try {
    if (currentUser.role === "admin") {

      // Promise.all() runs BOTH requests at the same time (parallel)
      // Instead of: wait for teachers → then wait for students (slow)
      // It does:    wait for teachers AND students at same time (fast)
      //
      // Array destructuring: [first, second] = [result1, result2]
      const [teachers, students] = await Promise.all([
        api("/teachers"),
        api("/students"),
      ]);

      // .length gives the count of items in an array
      // .textContent sets the visible text of an element
      document.getElementById("stat-teachers").textContent = teachers.length;
      document.getElementById("stat-students").textContent = students.length;

    } else {
      // Teacher — hide the "Total Teachers" card (not relevant for teacher)
      // .closest() goes UP the DOM tree to find the nearest matching parent
      document.getElementById("stat-teachers").closest(".stat-card").style.display = "none";

      const students = await api("/students");
      document.getElementById("stat-students").textContent = students.length;
    }

    // Fetch today's attendance count (works for both admin and teacher)
    // new Date() creates today's date object
    // .toISOString() converts to "2026-03-14T10:30:00.000Z"
    // .split("T")[0] keeps only the date part: "2026-03-14"
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = await api("/attendance?date=" + today);
    document.getElementById("stat-today").textContent = todayRecords.length;

  } catch(e) {
    // Just log to console — dashboard errors aren't critical
    console.log("Dashboard load error:", e.message);
  }
}


// ================================================================
// SECTION 9 — TEACHERS PAGE (Admin only)
// ================================================================

async function loadTeachers() {

  // Get the <tbody> element where we will inject table rows
  const tbody = document.getElementById("teachers-tbody");

  try {
    // Fetch all teachers from the backend
    // Also save to allTeachers state so other functions can use it
    allTeachers = await api("/teachers");

    // If no teachers exist yet, show a helpful empty state message
    if (allTeachers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No teachers found. Add one!</td></tr>`;
      return; // Stop here, nothing more to render
    }

    // Build table rows HTML for all teachers
    // .map() transforms each teacher object into a <tr> HTML string
    // Template literals (backticks) allow multi-line strings with ${variables}
    tbody.innerHTML = allTeachers.map(function(t) {
      return `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td>${t.email}</td>
          <td><span class="badge badge-teacher">Teacher</span></td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="openTeacherModal('${t._id}')">
              Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteTeacher('${t._id}', '${t.name}')" style="margin-left:6px">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join(""); // join("") merges all HTML strings into one

  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Error loading teachers.</td></tr>`;
  }
}


// Opens the Add/Edit Teacher modal popup
// teacherId is null when Adding, or has an ID string when Editing
function openTeacherModal(teacherId = null) {

  // Clear all form fields first (in case modal was used before)
  document.getElementById("teacher-edit-id").value  = teacherId || "";
  document.getElementById("teacher-name").value     = "";
  document.getElementById("teacher-email").value    = "";
  document.getElementById("teacher-password").value = "";
  document.getElementById("teacher-modal-alert").innerHTML = "";

  // Hide password field when editing (we don't allow password change here)
  // Show it when adding a new teacher (password is required for new accounts)
  // ternary: condition ? "none" : "block"
  document.getElementById("teacher-password-group").style.display =
    teacherId ? "none" : "block";

  if (teacherId) {
    // EDIT MODE — pre-fill form with existing teacher data

    // .find() searches the allTeachers array and returns the first item
    // where t._id equals teacherId
    // Arrow function: (t) => t._id === teacherId  means
    // "for each t, check if t._id equals teacherId"
    const teacher = allTeachers.find(t => t._id === teacherId);

    if (teacher) {
      document.getElementById("teacher-name").value  = teacher.name;
      document.getElementById("teacher-email").value = teacher.email;
    }

    document.getElementById("teacher-modal-title").textContent = "Edit Teacher";

  } else {
    // ADD MODE
    document.getElementById("teacher-modal-title").textContent = "Add Teacher";
  }

  // Show the modal by adding the "open" class
  // CSS: ".modal-overlay.open { display: flex }"
  document.getElementById("teacher-modal").classList.add("open");
}


// Called when user clicks "Save Teacher" inside the modal
async function saveTeacher() {

  // Read the hidden input that stores the teacher ID (empty if adding)
  const editId   = document.getElementById("teacher-edit-id").value;
  const name     = document.getElementById("teacher-name").value.trim();
  const email    = document.getElementById("teacher-email").value.trim();
  const password = document.getElementById("teacher-password").value;
  const alertBox = document.getElementById("teacher-modal-alert");

  // Validation — check required fields before sending to server
  if (!name || !email) {
    alertBox.innerHTML = '<div class="alert alert-error">Name and email are required.</div>';
    return;
  }

  // Password is only required when ADDING (not editing)
  if (!editId && !password) {
    alertBox.innerHTML = '<div class="alert alert-error">Password is required for new teacher.</div>';
    return;
  }

  try {
    if (editId) {
      // EDIT: PUT /api/teachers/:id with updated name and email
      await api(`/teachers/${editId}`, "PUT", { name, email });
    } else {
      // ADD: POST /api/teachers with name, email, password
      await api("/teachers", "POST", { name, email, password });
    }

    // Close the modal popup
    closeModal("teacher-modal");

    // Refresh the teachers table to show the new/updated data
    loadTeachers();

  } catch(e) {
    alertBox.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
  }
}


// Called when user clicks the "Delete" button on a teacher row
async function deleteTeacher(id, name) {

  // confirm() shows a browser dialog with OK/Cancel
  // Returns true if user clicks OK, false if Cancel
  // The ! at the start means "if user did NOT confirm → stop"
  if (!confirm(`Are you sure you want to delete ${name}?`)) return;

  try {
    // DELETE /api/teachers/:id
    await api(`/teachers/${id}`, "DELETE");

    // Refresh the table
    loadTeachers();

  } catch(e) {
    alert("Error: " + e.message);
  }
}


// ================================================================
// SECTION 10 — STUDENTS PAGE (Admin only)
// ================================================================

async function loadStudents() {

  const tbody = document.getElementById("students-tbody");

  try {
    // Load BOTH students and teachers at the same time
    // We need teachers list to fill the "Assign Teacher" dropdown
    // Array destructuring assigns results to variables in order
    [allStudents, allTeachers] = await Promise.all([
      api("/students"),
      api("/teachers"),
    ]);

    if (allStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No students found. Add one!</td></tr>`;
      return;
    }

    tbody.innerHTML = allStudents.map(function(s) {
      return `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.rollNumber}</td>
          <td>${s.className}</td>
          <td>
            ${s.assignedTeacher
              ? s.assignedTeacher.name
              : '<span style="color:#a0aec0">Unassigned</span>'
            }
          </td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="openStudentModal('${s._id}')">
              Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s._id}', '${s.name}')" style="margin-left:6px">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join("");

  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Error loading students.</td></tr>`;
  }
}


// Opens the Add/Edit Student modal
async function openStudentModal(studentId = null) {

  // Clear form fields
  document.getElementById("student-edit-id").value = studentId || "";
  document.getElementById("student-name").value    = "";
  document.getElementById("student-roll").value    = "";
  document.getElementById("student-class").value   = "";
  document.getElementById("student-modal-alert").innerHTML = "";

  // Fill the teacher dropdown with current teachers
  const teacherSelect = document.getElementById("student-teacher");

  // Build dropdown options HTML
  // First option is always "-- Not Assigned --" with empty value
  // Then one <option> per teacher
  teacherSelect.innerHTML =
    '<option value="">-- Not Assigned --</option>' +
    allTeachers.map(function(t) {
      return `<option value="${t._id}">${t.name}</option>`;
    }).join("");

  if (studentId) {
    // EDIT MODE — find student and pre-fill the form

    const student = allStudents.find(s => s._id === studentId);

    if (student) {
      document.getElementById("student-name").value  = student.name;
      document.getElementById("student-roll").value  = student.rollNumber;
      document.getElementById("student-class").value = student.className;

      // Set the dropdown to the student's current teacher
      // ?. is optional chaining: if assignedTeacher is null, don't crash
      // Instead of: student.assignedTeacher && student.assignedTeacher._id
      // We write: student.assignedTeacher?._id
      teacherSelect.value = student.assignedTeacher?._id || "";
    }

    document.getElementById("student-modal-title").textContent = "Edit Student";

  } else {
    document.getElementById("student-modal-title").textContent = "Add Student";
  }

  document.getElementById("student-modal").classList.add("open");
}


async function saveStudent() {

  const editId          = document.getElementById("student-edit-id").value;
  const name            = document.getElementById("student-name").value.trim();
  const rollNumber      = document.getElementById("student-roll").value.trim();
  const className       = document.getElementById("student-class").value.trim();
  const assignedTeacher = document.getElementById("student-teacher").value || null;
  // || null means: if value is empty string "", use null instead
  const alertBox        = document.getElementById("student-modal-alert");

  if (!name || !rollNumber || !className) {
    alertBox.innerHTML = '<div class="alert alert-error">Name, Roll Number, and Class are required.</div>';
    return;
  }

  try {
    if (editId) {
      await api(`/students/${editId}`, "PUT", { name, rollNumber, className, assignedTeacher });
    } else {
      await api("/students", "POST", { name, rollNumber, className, assignedTeacher });
    }

    closeModal("student-modal");
    loadStudents();

  } catch(e) {
    alertBox.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
  }
}


async function deleteStudent(id, name) {
  if (!confirm(`Delete student ${name}?`)) return;

  try {
    await api(`/students/${id}`, "DELETE");
    loadStudents();
  } catch(e) {
    alert("Error: " + e.message);
  }
}


// ================================================================
// SECTION 11 — MY STUDENTS PAGE (Teacher only)
// ================================================================

async function loadMyStudents() {

  const tbody = document.getElementById("my-students-tbody");

  try {
    // GET /api/students
    // The backend automatically filters by the logged-in teacher's ID
    // So a teacher only gets their own students back
    const students = await api("/students");

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="empty-state">No students assigned to you yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map(function(s) {
      return `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.rollNumber}</td>
          <td>${s.className}</td>
        </tr>
      `;
    }).join("");

  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">Error loading students.</td></tr>`;
  }
}


// ================================================================
// SECTION 12 — MARK ATTENDANCE PAGE (Teacher only)
// ================================================================

// Called when teacher navigates to the Mark Attendance page
function loadAttendancePage() {

  // Set today's date as the default selected date
  // new Date() = right now
  // .toISOString() = "2026-03-14T10:30:00.000Z"
  // .split("T")[0] = "2026-03-14" (just the date part)
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("att-date").value = today;

  // Clear any previously loaded student list
  document.getElementById("attendance-form-area").innerHTML = "";
}


// Called when teacher clicks "Load Students" button
async function loadAttendanceForm() {

  // Read the selected date from the date input
  const date = document.getElementById("att-date").value;
  const area = document.getElementById("attendance-form-area");

  if (!date) {
    alert("Please select a date.");
    return;
  }

  // Show loading message while fetching
  area.innerHTML = '<div class="loading">Loading students...</div>';

  try {
    // Fetch this teacher's assigned students
    const students = await api("/students");

    if (students.length === 0) {
      area.innerHTML = '<div class="empty-state">No students assigned to you.</div>';
      return;
    }

    // Fetch any attendance already marked for this date
    // This lets us pre-fill the radio buttons if attendance was already marked
    const existing = await api("/attendance?date=" + date);

    // Build a lookup map: { studentId: "Present" or "Absent" }
    // This lets us quickly check a student's status without looping
    // Example: existingMap["abc123"] = "Present"
    const existingMap = {};
    existing.forEach(function(record) {
      existingMap[record.student._id] = record.status;
    });

    // ---- IMPORTANT: Store data in window (global) variables ----
    // We cannot pass complex data through HTML onclick attributes safely
    // So we store them globally and submitAttendance() reads them
    // window._x means a global variable named _x
    window._attendanceStudents = students;
    window._attendanceDate     = date;

    // Build the attendance form HTML
    // For each student, create a row with Present/Absent radio buttons
    area.innerHTML = `
      <div class="attendance-grid">
        ${students.map(function(s) {
          return `
            <div class="attendance-row">

              <div>
                <div class="student-info">${s.name}</div>
                <div class="roll-info">Roll: ${s.rollNumber} | ${s.className}</div>
              </div>

              <div class="att-toggle">

                <label>
                  <input
                    type="radio"
                    name="att-${s._id}"
                    value="Present"
                    ${existingMap[s._id] === "Present" ? "checked" : ""}
                  />
                  <span>Present</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="att-${s._id}"
                    value="Absent"
                    ${existingMap[s._id] === "Absent" ? "checked" : ""}
                  />
                  <span>Absent</span>
                </label>

              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div style="margin-top:20px;">
        <button class="btn btn-success" onclick="submitAttendance()">
          ✅ Save Attendance for ${date}
        </button>
      </div>

      <div id="att-save-msg" style="margin-top:12px"></div>
    `;

  } catch(e) {
    area.innerHTML = `<div class="empty-state">Error: ${e.message}</div>`;
  }
}


// Called when teacher clicks "Save Attendance" button
async function submitAttendance() {

  // Read the globally stored students and date
  // These were stored in loadAttendanceForm()
  const students = window._attendanceStudents;
  const date     = window._attendanceDate;

  // Safety check — make sure data exists
  if (!students || !date) {
    alert("Please load students first.");
    return;
  }

  // Build the records array by reading each radio button's selection
  const records = [];

  // for...of loop: loops through each item in the students array
  // s = each individual student object
  for (const s of students) {

    // Find the checked radio button for this student
    // The name attribute is "att-{studentId}" — unique per student
    // :checked is a CSS selector that only matches selected radio buttons
    const selected = document.querySelector(`input[name="att-${s._id}"]:checked`);

    // If teacher forgot to mark one student
    if (!selected) {
      alert(`Please mark attendance for ${s.name} before saving.`);
      return; // Stop and don't save anything
    }

    // Add this student's record to the array
    // selected.value is either "Present" or "Absent"
    records.push({
      studentId: s._id,
      status: selected.value
    });
  }

  try {
    // Send all records to the backend in one request
    // .trim() removes any whitespace from the date string
    await api("/attendance/mark", "POST", { date: date.trim(), records });

    // Show success message
    document.getElementById("att-save-msg").innerHTML =
      '<div class="alert alert-success">✅ Attendance saved successfully!</div>';

    // Auto-hide the success message after 3 seconds
    // setTimeout(function, milliseconds) runs the function after a delay
    // 3000 milliseconds = 3 seconds
    setTimeout(function() {
      document.getElementById("att-save-msg").innerHTML = "";
    }, 3000);

  } catch(e) {
    document.getElementById("att-save-msg").innerHTML =
      `<div class="alert alert-error">❌ Error: ${e.message}</div>`;
  }
}


// ================================================================
// SECTION 13 — REPORTS PAGE (Admin + Teacher)
// ================================================================

// Called when Reports page is opened
async function loadReportsPage() {

  const select = document.getElementById("report-student-select");

  try {
    // Fetch students (admin gets all, teacher gets only theirs)
    const students = await api("/students");

    // Fill the dropdown with student options
    select.innerHTML =
      '<option value="">-- Select Student --</option>' +
      students.map(function(s) {
        return `<option value="${s._id}">${s.name} (${s.rollNumber})</option>`;
      }).join("");

  } catch(e) {
    console.log("Error loading students for report:", e.message);
  }

  // Clear any previously shown report
  document.getElementById("report-area").innerHTML = "";
}


// Called when user clicks "View Report" button
async function loadReport() {

  // Get the selected student's ID from the dropdown
  // .value on a <select> returns the value of the selected <option>
  const studentId = document.getElementById("report-student-select").value;
  const area      = document.getElementById("report-area");

  if (!studentId) {
    alert("Please select a student.");
    return;
  }

  area.innerHTML = '<div class="loading">Loading report...</div>';

  try {
    // GET /api/attendance/report/:studentId
    // Returns { records: [...], summary: { totalDays, presentDays, ... } }
    const data = await api("/attendance/report/" + studentId);

    // Destructure the response into two variables
    const { records, summary } = data;

    if (records.length === 0) {
      area.innerHTML = '<div class="empty-state">No attendance records found for this student.</div>';
      return;
    }

    // Get student name from first record
    // ?. = optional chaining: if records[0] or student is null, return undefined
    // || "Student" = fallback text if name is undefined
    const studentName = records[0]?.student?.name || "Student";

    // Build the report HTML with summary boxes + detailed table
    area.innerHTML = `
      <h3 style="margin-bottom:16px; color:#1a365d;">Report: ${studentName}</h3>

      <div class="report-summary">

        <div class="summary-box">
          <div class="num">${summary.totalDays}</div>
          <div class="lbl">Total Days</div>
        </div>

        <div class="summary-box">
          <div class="num" style="color:#38a169">${summary.presentDays}</div>
          <div class="lbl">Present</div>
        </div>

        <div class="summary-box">
          <div class="num" style="color:#e53e3e">${summary.absentDays}</div>
          <div class="lbl">Absent</div>
        </div>

        <div class="summary-box">
          <div class="num" style="color:#d69e2e">${summary.percentage}</div>
          <div class="lbl">Attendance %</div>
        </div>

      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Marked By</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(function(r) {

              // Format the date into a readable format
              // new Date(r.date) creates a Date object from the stored date string
              // .toLocaleDateString("en-IN", {...}) formats it for Indian locale
              // Result: "14 Mar 2026"
              const formattedDate = new Date(r.date).toLocaleDateString("en-IN", {
                day:   "numeric",
                month: "short",
                year:  "numeric"
              });

              // r.status.toLowerCase() converts "Present" → "present"
              // Used to match CSS class: badge-present or badge-absent
              return `
                <tr>
                  <td>${formattedDate}</td>
                  <td>
                    <span class="badge badge-${r.status.toLowerCase()}">
                      ${r.status}
                    </span>
                  </td>
                  <td>${r.markedBy?.name || "—"}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;

  } catch(e) {
    area.innerHTML = `<div class="empty-state">Error: ${e.message}</div>`;
  }
}


// ================================================================
// SECTION 14 — MODAL HELPERS
// ================================================================

// Closes any modal by removing the "open" class
// id is the id of the modal overlay div
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  // CSS: ".modal-overlay { display: none }" takes effect again
}


// Close modal when clicking on the dark background (outside the modal box)
// .forEach() loops through all modal overlays
document.querySelectorAll(".modal-overlay").forEach(function(overlay) {

  // Add a click event listener to each overlay
  overlay.addEventListener("click", function(e) {

    // e.target = the element that was actually clicked
    // this = the overlay div itself
    //
    // If you click INSIDE the white modal box:
    //   e.target = the modal div or a button/input inside it
    //   this = the overlay div
    //   e.target !== this → do NOT close
    //
    // If you click on the dark background (the overlay itself):
    //   e.target = the overlay div
    //   this = the overlay div
    //   e.target === this → close the modal
    if (e.target === this) {
      this.classList.remove("open");
    }
  });
});


// ================================================================
// SECTION 15 — AUTO LOGIN
// When the page first loads, check if the user was already
// logged in before. If their token is still saved, skip the
// login page and go straight to the app.
// ================================================================

window.addEventListener("load", function() {

  // Try to read saved login data from localStorage
  const savedUser  = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");

  if (savedUser && savedToken) {
    // Both exist → user was previously logged in

    // JSON.parse() converts the JSON string back to a JavaScript object
    // Opposite of JSON.stringify() which we used when saving
    currentUser = JSON.parse(savedUser);

    // Skip the login page and start the app directly
    initApp();
  }

  // If nothing in localStorage → login page stays visible (default)
  // The user needs to log in manually
});
