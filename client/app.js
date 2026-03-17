

// The base URL of your backend server.
// Every API call starts with this URL.
// If you change the port in .env, update it here too.
const API_BASE = "http://localhost:5000/api";




// Stores the logged-in user's info (name, email, role, token)
// null means nobody is logged in yet
let currentUser = null;

// Stores the list of teachers fetched from the backend
// Used to fill the "Assign Teacher" dropdown in the student form
let allTeachers = [];

// Stores the list of students fetched from the backend
// Used to fill the edit modal with existing student data
let allStudents = [];




async function api(endpoint, method = "GET", body = null) {
  // ---- Step 1: Get the saved login token from browser storage ----
 
  const token = localStorage.getItem("token");

  // ---- Step 2: Build the request options object ----

  const options = {
    method, // GET, POST, PUT, or DELETE

    headers: {
      // Tell the server we are sending JSON data
      "Content-Type": "application/json",


      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // ---- Step 3: If there's data to send (POST/PUT), add it as body ----
 
  if (body) {
    options.body = JSON.stringify(body);
  }

  // ---- Step 4: Make the actual HTTP request ----

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  // ---- Step 5: Convert the response from JSON text to JS object ----

  const data = await response.json();

  // ---- Step 6: Check if the request was successful ----
 
  if (!response.ok) {

    throw new Error(data.message || "Something went wrong");
  }

  // ---- Step 7: Return the data to whoever called this function ----
  return data;
}

 

// Called when the user clicks the "Sign In" button
// Also called when user presses Enter in the password field
async function handleLogin() {

  // Read what the user typed in the email and password fields
 
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;


  const alertBox = document.getElementById("login-alert");


  if (!email || !password) {
  
    alertBox.innerHTML = '<div class="alert alert-error">Please fill in all fields.</div>';
    return; 
  }

  
  try {
    
    const data = await api("/auth/login", "POST", { email, password });

  
    localStorage.setItem("token", data.token);

   
    localStorage.setItem("user", JSON.stringify(data));
 
    currentUser = data;

    
    alertBox.innerHTML = "";

    
    initApp();

  } catch (error) {
    
    alertBox.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  }
}



document.getElementById("login-password").addEventListener("keypress", function(e) {
 
  if (e.key === "Enter") {
    handleLogin(); 
  }
});



function handleLogout() {

 
  localStorage.removeItem("token");
  localStorage.removeItem("user");

 
  currentUser = null;

  // Hide the main app
  document.getElementById("app").style.display = "none";

  // Show the login page again
  document.getElementById("login-page").style.display = "flex";

  // Clear the login form fields so the next person starts fresh
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
}

 

function initApp() {

  // Hide login page
  document.getElementById("login-page").style.display = "none";

  // Show the main app container
  document.getElementById("app").style.display = "block";

   // Show the user's name and role in the top-right of navbar
  document.getElementById("nav-user-info").textContent =
    `${currentUser.name} (${currentUser.role})`;

  // Build the correct sidebar menu based on role
  buildSidebar();

  // Navigate to dashboard as the first page
  navigateTo("dashboard");
}




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

  
  // condition ? valueIfTrue : valueIfFalse  
  const menu = currentUser.role === "admin" ? adminMenu : teacherMenu;

 
  sidebar.innerHTML = menu
    .map(item =>
      `<div class="menu-item" id="menu-${item.id}" onclick="navigateTo('${item.id}')">
        ${item.label}
      </div>`
    )
    .join("");
}




function navigateTo(pageId) {


  document.querySelectorAll(".page").forEach(function(p) {
    p.classList.remove("active");
  });
 
  document.querySelectorAll(".menu-item").forEach(function(m) {
    m.classList.remove("active");
  });


  const page = document.getElementById("page-" + pageId);
  if (page) {
    page.classList.add("active");
  }
 
  const menuItem = document.getElementById("menu-" + pageId);
  if (menuItem) {
    menuItem.classList.add("active");
  }

 
  if (pageId === "dashboard")   loadDashboard();
  if (pageId === "teachers")    loadTeachers();
  if (pageId === "students")    loadStudents();
  if (pageId === "my-students") loadMyStudents();
  if (pageId === "attendance")  loadAttendancePage();
  if (pageId === "reports")     loadReportsPage();
}




async function loadDashboard() {
  try {
    if (currentUser.role === "admin") {

 
      const [teachers, students] = await Promise.all([
        api("/teachers"),
        api("/students"),
      ]);

  
      document.getElementById("stat-teachers").textContent = teachers.length;
      document.getElementById("stat-students").textContent = students.length;

    } else {
     
      document.getElementById("stat-teachers").closest(".stat-card").style.display = "none";

      const students = await api("/students");
      document.getElementById("stat-students").textContent = students.length;
    }

   
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = await api("/attendance?date=" + today);
    document.getElementById("stat-today").textContent = todayRecords.length;

  } catch(e) {
   
    console.log("Dashboard load error:", e.message);
  }
}




async function loadTeachers() {

  // Get the <tbody> element where we will inject table rows
  const tbody = document.getElementById("teachers-tbody");

  try {
    // Fetch all teachers from the backend
    
    allTeachers = await api("/teachers");

    // If no teachers exist yet, show a helpful empty state message
    if (allTeachers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No teachers found. Add one!</td></tr>`;
      return;
    }

  
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
    }).join(""); 

  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Error loading teachers.</td></tr>`;
  }
}


// Opens the Add/Edit Teacher modal popup

function openTeacherModal(teacherId = null) {


  document.getElementById("teacher-edit-id").value  = teacherId || "";
  document.getElementById("teacher-name").value     = "";
  document.getElementById("teacher-email").value    = "";
  document.getElementById("teacher-password").value = "";
  document.getElementById("teacher-modal-alert").innerHTML = "";


  document.getElementById("teacher-password-group").style.display =
    teacherId ? "none" : "block";

  if (teacherId) {
  
    const teacher = allTeachers.find(t => t._id === teacherId);

    if (teacher) {
      document.getElementById("teacher-name").value  = teacher.name;
      document.getElementById("teacher-email").value = teacher.email;
    }

    document.getElementById("teacher-modal-title").textContent = "Edit Teacher";

  } else {
    
    document.getElementById("teacher-modal-title").textContent = "Add Teacher";
  }

 
  document.getElementById("teacher-modal").classList.add("open");
}



async function saveTeacher() {

  
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

  // Password is only required when ADDING
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




async function loadStudents() {

  const tbody = document.getElementById("students-tbody");

  try {
    // Load BOTH students and teachers at the same time
 
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

 

async function loadMyStudents() {

  const tbody = document.getElementById("my-students-tbody");

  try {
   
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

 

// Called when teacher navigates to the Mark Attendance page
function loadAttendancePage() {


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
    const existing = await api("/attendance?date=" + date);

  
    const existingMap = {};
    existing.forEach(function(record) {
      existingMap[record.student._id] = record.status;
    });


    window._attendanceStudents = students;
    window._attendanceDate     = date;


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
 
  for (const s of students) {

    // Find the checked radio button for this student
  
    const selected = document.querySelector(`input[name="att-${s._id}"]:checked`);

    // If teacher forgot to mark one student
    if (!selected) {
      alert(`Please mark attendance for ${s.name} before saving.`);
      return; // Stop and don't save anything
    }

    // Add this student's record to the array
  
    records.push({
      studentId: s._id,
      status: selected.value
    });
  }

  try {
    // Send all records to the backend in one request
  
    await api("/attendance/mark", "POST", { date: date.trim(), records });

    // Show success message
    document.getElementById("att-save-msg").innerHTML =
      '<div class="alert alert-success">✅ Attendance saved successfully!</div>';

    // Auto-hide the success message after 3 seconds

    setTimeout(function() {
      document.getElementById("att-save-msg").innerHTML = "";
    }, 3000);

  } catch(e) {
    document.getElementById("att-save-msg").innerHTML =
      `<div class="alert alert-error">❌ Error: ${e.message}</div>`;
  }
}

 

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
  const studentId = document.getElementById("report-student-select").value;
  const area      = document.getElementById("report-area");

  if (!studentId) {
    alert("Please select a student.");
    return;
  }

  area.innerHTML = '<div class="loading">Loading report...</div>';

  try {
     // GET /api/attendance/report/:studentId
    const data = await api("/attendance/report/" + studentId);

    // Destructure the response into two variables
    const { records, summary } = data;

    if (records.length === 0) {
      area.innerHTML = '<div class="empty-state">No attendance records found for this student.</div>';
      return;
    }

    // Get student name from first record

    const studentName = records[0]?.student?.name || "Student";

    
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

              
              const formattedDate = new Date(r.date).toLocaleDateString("en-IN", {
                day:   "numeric",
                month: "short",
                year:  "numeric"
              });
 
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

 

// Closes any modal by removing the "open" class

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  
}



document.querySelectorAll(".modal-overlay").forEach(function(overlay) {

  // Add a click event listener to each overlay
  overlay.addEventListener("click", function(e) {


    if (e.target === this) {
      this.classList.remove("open");
    }
  });
});

 

window.addEventListener("load", function() {

  // Try to read saved login data from localStorage
  const savedUser  = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");

  if (savedUser && savedToken) {
    // Both exist → user was previously logged in


    currentUser = JSON.parse(savedUser);

    // Skip the login page and start the app directly
    initApp();
  }

  // If nothing in localStorage → login page stays visible (default)
  // The user needs to log in manually
});
