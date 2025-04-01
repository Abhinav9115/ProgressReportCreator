/**
 * UI Components for the Report Card Generator
 * Defines reusable UI components used throughout the app
 */
(function() {
  /**
   * Creates a reusable Navbar component
   * @returns {HTMLElement} Navbar element
   */
  function createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'bg-primary text-primary-foreground shadow-md';

    navbar.innerHTML = `
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-school text-xl"></i>
          <span class="font-heading font-semibold text-xl">Report Card Generator</span>
        </div>
        <div class="flex items-center space-x-4">
          <button 
            id="theme-toggle-btn"
            class="p-2 rounded-full bg-white/90 dark:bg-slate-800 shadow-sm flex items-center justify-center hover:scale-105 transition-transform ripple"
            title="Toggle theme"
          >
            <span id="theme-toggle-icon">
              <i class="fa-solid fa-moon"></i>
            </span>
          </button>
        </div>
      </div>
    `;

    // Add event listener for theme toggle
    const themeToggleBtn = navbar.querySelector('#theme-toggle-btn');
    themeToggleBtn.addEventListener('click', () => {
      window.themeManager.toggleTheme();
    });

    return navbar;
  }

  /**
   * Creates a Student Table component
   * @param {Object[]} students - Student data
   * @param {Object} options - Table options
   * @returns {HTMLElement} Table container
   */
  function createStudentTable(students, options = {}) {
    const {
      onEdit = () => { },
      onViewReport = () => { },
      onDelete = () => { },
      onAddStudent = () => { },
      onAddSampleStudent = () => { }
    } = options;

    const container = document.createElement('div');
    container.className = 'animate-fade-in';

    if (!students || students.length === 0) {
      // Empty state
      container.innerHTML = `
        <div class="bg-card text-card-foreground rounded-lg shadow p-8 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-8">
          <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <i class="fa-solid fa-user-graduate text-2xl"></i>
          </div>
          <h3 class="text-lg font-semibold">No Students Found</h3>
          <p class="text-center text-muted-foreground">
            You haven't added any students yet. Add a student to generate report cards.
          </p>
          <div class="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <button id="add-student-btn" class="btn btn-primary">
              <i class="fa-solid fa-plus mr-2"></i> Add Student
            </button>
            <button id="add-sample-student-btn" class="btn btn-secondary">
              <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> Add Sample
            </button>
          </div>
        </div>
      `;

      container.querySelector('#add-student-btn').addEventListener('click', onAddStudent);
      container.querySelector('#add-sample-student-btn').addEventListener('click', onAddSampleStudent);

      return container;
    }

    // Table UI
    container.innerHTML = `
      <div class="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 class="font-heading font-semibold">Students</h2>
          <div class="flex gap-2">
            <button id="add-student-btn" class="btn btn-primary text-sm py-1">
              <i class="fa-solid fa-plus mr-1"></i> Add Student
            </button>
            <button id="add-sample-btn" class="btn btn-secondary text-sm py-1">
              <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Add Sample
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Admission No.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="students-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = container.querySelector('#students-tbody');

    // Add rows for each student
    students.forEach(student => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-muted transition-colors';

      tr.innerHTML = `
        <td class="font-medium">${student.name}</td>
        <td>${student.class} - ${student.section}</td>
        <td>${student.admissionNumber}</td>
        <td>
          <div class="flex space-x-2">
            <button class="view-report-btn btn btn-ghost text-sm py-1">
              <i class="fa-solid fa-file-alt mr-1"></i> View
            </button>
            <button class="edit-student-btn btn btn-ghost text-sm py-1">
              <i class="fa-solid fa-edit mr-1"></i> Edit
            </button>

            <button class="delete-student-btn btn btn-ghost text-sm py-1 text-red-500">
              <i class="fa-solid fa-trash-alt mr-1"></i>
            </button>
            <button class="download-pdf-btn btn btn-ghost text-sm py-1 text-primary">
              <i class="fa-solid fa-download mr-1"></i> PDF
            </button>
          </div>
        </td>
      `;

      // Add event listeners
      tr.querySelector('.view-report-btn').addEventListener('click', () => onViewReport(student));
      tr.querySelector('.edit-student-btn').addEventListener('click', () => onEdit(student));
      tr.querySelector('.delete-student-btn').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
          onDelete(student.id);
        }
      });

      tr.querySelector('.download-pdf-btn').addEventListener('click', () => {
        const reportData = window.reportUtils.generateReportCardData(student);
        window.reportUtils.generatePDF(reportData);
      });

      tbody.appendChild(tr);
    });

    // Add button event listeners
    container.querySelector('#add-student-btn').addEventListener('click', onAddStudent);
    container.querySelector('#add-sample-btn').addEventListener('click', onAddSampleStudent);

    return container;
  }

  /**
   * Creates a Student Form component
   * @param {Object|null} student - Student data (null for new student)
   * @param {Object} options - Form options
   * @returns {HTMLElement} Form container
   */
  function createStudentForm(student = null, options = {}) {
    const {
      onBack = () => { },
      onStudentAdded = () => { }
    } = options;

    const isEditing = !!student;
    const title = isEditing ? `Edit ${student.name}` : 'Add New Student';

    // Default empty marks structure
    const DEFAULT_MARKS = {
      session1: 0,
      halfYearly: 0,
      session2: 0,
      final: 0
    };

    // Default subjects if creating new student
    const DEFAULT_SUBJECTS = {
      hindi: { ...DEFAULT_MARKS },
      english: { ...DEFAULT_MARKS },
      mathematics: { ...DEFAULT_MARKS },
      science: { ...DEFAULT_MARKS },
      socialScience: { ...DEFAULT_MARKS },
      environmentalStudies: { ...DEFAULT_MARKS },
      homeScience: { ...DEFAULT_MARKS },
      artMusic: { ...DEFAULT_MARKS },
      sanskrit: { ...DEFAULT_MARKS },
      sports: { ...DEFAULT_MARKS }
    };

    const container = document.createElement('div');
    container.className = 'animate-fade-in';

    container.innerHTML = `
      <form id="student-form" class="max-w-4xl mx-auto">
        <div class="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 class="font-heading font-semibold text-xl">${title}</h2>
            <button type="button" id="back-btn" class="btn btn-ghost">
              <i class="fa-solid fa-arrow-left mr-2"></i> Back
            </button>
          </div>

          <!-- Form Fields -->
          <div class="p-6 space-y-6">
            <!-- Personal Information -->
            <div>
              <h3 class="text-lg font-medium mb-4">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="name">Full Name <span class="text-red-500">*</span></label>
                  <input type="text" id="name" name="name" required>
                </div>
                <div>
                  <label for="fatherName">Father's Name <span class="text-red-500">*</span></label>
                  <input type="text" id="fatherName" name="fatherName" required>
                </div>
                <div>
                  <label for="admissionNumber">Admission Number <span class="text-red-500">*</span></label>
                  <input type="text" id="admissionNumber" name="admissionNumber" required>
                </div>
                <div>
                  <label for="dob">Date of Birth</label>
                  <input type="date" id="dob" name="dob">
                </div>
                <div>
                  <label for="gender">Gender</label>
                  <select id="gender" name="gender">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label for="address">Address</label>
                  <input type="text" id="address" name="address">
                </div>
                <div>
                  <label for="class">Class <span class="text-red-500">*</span></label>
                  <select id="class" name="class" required>
                    <option value="">Select</option>
                    ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label for="section">Section <span class="text-red-500">*</span></label>
                  <select id="section" name="section" required>
                    <option value="">Select</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Academic Information -->
            <div>
              <h3 class="text-lg font-medium mb-4">Academic Information</h3>

              <div class="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Session 1</th>
                      <th>Half Yearly</th>
                      <th>Session 2</th>
                      <th>Final</th>
                    </tr>
                  </thead>
                  <tbody id="subjects-tbody"></tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end px-6 py-4 border-t border-border">
            <button type="button" id="cancel-btn" class="btn btn-ghost mr-2">Cancel</button>
            <button type="submit" class="btn btn-primary">
              ${isEditing ? 'Update' : 'Add'} Student
            </button>
          </div>
        </div>
      </form>
    `;

    // Add subject rows
    const subjectLabels = {
      hindi: 'Hindi',
      english: 'English',
      mathematics: 'Mathematics',
      science: 'Science',
      socialScience: 'Social Science',
      environmentalStudies: 'Environmental Studies',
      homeScience: 'Home Science / Agriculture',
      artMusic: 'Art & Music',
      sanskrit: 'Sanskrit',
      sports: 'Sports / Physical Education'
    };

    const tbody = container.querySelector('#subjects-tbody');

    Object.entries(subjectLabels).forEach(([subject, label]) => {
      const tr = document.createElement('tr');

      const marks = student?.subjects?.[subject] || DEFAULT_SUBJECTS[subject];

      tr.innerHTML = `
        <td class="font-medium">${label}</td>
        <td>
          <input type="number" min="0" max="10" name="${subject}.session1" value="${marks.session1}" class="w-16">
        </td>
        <td>
          <input type="number" min="0" max="30" name="${subject}.halfYearly" value="${marks.halfYearly}" class="w-16">
        </td>
        <td>
          <input type="number" min="0" max="10" name="${subject}.session2" value="${marks.session2}" class="w-16">
        </td>
        <td>
          <input type="number" min="0" max="50" name="${subject}.final" value="${marks.final}" class="w-16">
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Populate form if editing
    if (isEditing) {
      container.querySelector('#name').value = student.name || '';
      container.querySelector('#fatherName').value = student.fatherName || '';
      container.querySelector('#admissionNumber').value = student.admissionNumber || '';
      container.querySelector('#dob').value = student.dob || '';
      container.querySelector('#gender').value = student.gender || '';
      container.querySelector('#address').value = student.address || '';
      container.querySelector('#class').value = student.class || '';
      container.querySelector('#section').value = student.section || '';
    }

    // Form submission
    const form = container.querySelector('#student-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect form data
      const formData = new FormData(form);
      const subjects = {};

      // Basic student data
      const studentData = {
        name: formData.get('name'),
        fatherName: formData.get('fatherName'),
        admissionNumber: formData.get('admissionNumber'),
        dob: formData.get('dob'),
        gender: formData.get('gender'),
        address: formData.get('address'),
        class: formData.get('class'),
        section: formData.get('section'),
      };

      // Process marks for each subject
      Object.keys(subjectLabels).forEach(subject => {
        subjects[subject] = {
          session1: parseInt(formData.get(`${subject}.session1`) || 0),
          halfYearly: parseInt(formData.get(`${subject}.halfYearly`) || 0),
          session2: parseInt(formData.get(`${subject}.session2`) || 0),
          final: parseInt(formData.get(`${subject}.final`) || 0)
        };
      });

      // Complete student data
      const completeStudentData = {
        ...studentData,
        subjects,
      };

      // If editing, preserve the ID
      if (isEditing) {
        completeStudentData.id = student.id;
        completeStudentData.dateAdded = student.dateAdded;

        const updated = window.storage.updateStudent(completeStudentData);
        if (updated) {
          alert('Student updated successfully');
          onStudentAdded();
        } else {
          alert('Error updating student');
        }
      } else {
        // Add new student
        const newStudent = window.storage.addStudent(completeStudentData);
        if (newStudent) {
          alert('Student added successfully');
          onStudentAdded();
        } else {
          alert('Error adding student');
        }
      }
    });

    // Back/cancel button handlers
    container.querySelector('#back-btn').addEventListener('click', onBack);
    container.querySelector('#cancel-btn').addEventListener('click', onBack);

    return container;
  }

  /**
   * Creates a Report Card component
   * @param {Object} student - Student data
   * @param {Object} options - Report options
   * @returns {HTMLElement} Report container
   */
  function createReportCard(student, options = {}) {
    const {
      onBack = () => { },
      onEdit = () => { }
    } = options;

    // Generate the report data
    const reportData = window.reportUtils.generateReportCardData(student);
    const schoolInfo = window.storage.getSchoolInfo();

    const container = document.createElement('div');
    container.className = 'animate-fade-in';

    container.innerHTML = `
      <div class="max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="font-heading font-semibold text-xl">Report Card</h2>
          <div class="flex space-x-2">
            <button id="back-btn" class="btn btn-ghost">
              <i class="fa-solid fa-arrow-left mr-2"></i> Back
            </button>
            <button id="edit-btn" class="btn btn-ghost">
              <i class="fa-solid fa-edit mr-2"></i> Edit
            </button>
            <button id="download-btn" class="btn btn-primary">
              <i class="fa-solid fa-download mr-2"></i> Download PDF
            </button>
          </div>
        </div>

        <!-- Report Content -->
        <div class="p-6 space-y-6">
          <!-- School Header -->
          <div class="text-center mb-6">
            <div class="flex items-center justify-center space-x-4 mb-4">
              ${schoolInfo.logo1 ? `
                <img src="${schoolInfo.logo1}" alt="School Logo 1" class="h-16 w-auto">
              ` : ''}
              <h1 class="text-2xl font-bold text-primary">${schoolInfo.name}</h1>
              ${schoolInfo.logo2 ? `
                <img src="${schoolInfo.logo2}" alt="School Logo 2" class="h-16 w-auto">
              ` : ''}
            </div>
            <p class="text-muted-foreground">${schoolInfo.address}</p>
            <p class="text-muted-foreground mt-1">Academic Session 2024-2025</p>
          </div>

          <!-- Student Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-4">
            <div>
              <p><span class="font-semibold">Name:</span> ${reportData.name}</p>
              <p><span class="font-semibold">Father's Name:</span> ${reportData.fatherName}</p>
              <p><span class="font-semibold">Admission No:</span> ${reportData.admissionNumber}</p>
            </div>
            <div>
              <p><span class="font-semibold">Class:</span> ${reportData.class} - ${reportData.section}</p>
              <p><span class="font-semibold">Roll No:</span> ${reportData.rollNo}</p>
              <p><span class="font-semibold">DOB:</span> ${window.reportUtils.formatDate(reportData.dob) || 'N/A'}</p>
            </div>
          </div>

          <!-- Marks Table -->
          <div class="overflow-x-auto">
            <table id="marks-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Session 1</th>
                  <th>Half Yearly</th>
                  <th>Session 2</th>
                  <th>Final</th>
                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody id="marks-tbody"></tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-right font-semibold">Overall Result:</td>
                  <td class="font-semibold">${reportData.totalMarks}/${reportData.totalPossibleMarks}</td>
                  <td class="font-semibold">${reportData.overallGrade}</td>
                </tr>
                <tr>
                  <td colspan="7" class="text-right font-semibold">
                    Percentage: ${reportData.percentage}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Remarks -->
          <div class="mt-4 p-4 bg-muted rounded-md">
            <p><span class="font-semibold">Remarks:</span> ${reportData.remarks}</p>
          </div>

          <!-- Signatures -->
          <div class="grid grid-cols-2 gap-8 mt-8 pt-4">
            <div class="text-center">
              <div class="border-t border-border pt-2 mx-auto w-40"></div>
              <p class="mt-2">Class Teacher</p>
            </div>
            <div class="text-center">
              <div class="border-t border-border pt-2 mx-auto w-40"></div>
              <p class="mt-2">Principal</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add marks to table
    const tbody = container.querySelector('#marks-tbody');
    const subjectLabels = {
      hindi: 'Hindi',
      english: 'English',
      mathematics: 'Mathematics',
      science: 'Science',
      socialScience: 'Social Science',
      environmentalStudies: 'Environmental Studies',
      homeScience: 'Home Science / Agriculture',
      artMusic: 'Art & Music',
      sanskrit: 'Sanskrit',
      sports: 'Sports / Physical Education'
    };

    Object.entries(reportData.subjects).forEach(([subject, marks]) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="font-medium">${subjectLabels[subject] || subject}</td>
        <td>${marks.session1}</td>
        <td>${marks.halfYearly}</td>
        <td>${marks.session2}</td>
        <td>${marks.final}</td>
        <td class="font-medium">${marks.total}</td>
        <td class="font-medium">${marks.grade}</td>
      `;

      tbody.appendChild(tr);
    });

    // Event listeners
    container.querySelector('#back-btn').addEventListener('click', onBack);
    container.querySelector('#edit-btn').addEventListener('click', () => onEdit(student));
    container.querySelector('#download-btn').addEventListener('click', () => {
      window.reportUtils.generatePDF(reportData);
    });

    return container;
  }


  /**
   * Creates a School Edit Form component
   * @param {Object} options - Form options
   * @returns {HTMLElement} Form container
   */
  function createSchoolForm(options = {}) {
    const { onSave = () => {}, onClose = () => {} } = options;
    const schoolInfo = window.storage.getSchoolInfo();

    const container = document.createElement('div');
    container.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';

    container.innerHTML = `
      <div class="bg-card text-card-foreground rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 class="font-heading font-semibold">Edit School Information</h3>
          <button id="close-btn" class="text-muted-foreground hover:text-foreground">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <form id="school-form" class="p-6 space-y-4">
          <div>
            <label for="school-name">School Name</label>
            <input 
              type="text" 
              id="school-name" 
              value="${schoolInfo.name}"
              class="w-full"
              required
            >
          </div>

          <div>
            <label for="school-address">School Address</label>
            <textarea 
              id="school-address" 
              class="w-full h-24"
            >${schoolInfo.address}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="school-logo-1">School Logo 1 (Left)</label>
              <input 
                type="file" 
                id="school-logo-1" 
                accept="image/*"
                class="w-full"
              >
              ${schoolInfo.logo1 ? '<p class="text-sm text-muted-foreground mt-1">Current logo 1 is set</p>' : ''}
            </div>

            <div>
              <label for="school-logo-2">School Logo 2 (Right)</label>
              <input 
                type="file" 
                id="school-logo-2" 
                accept="image/*"
                class="w-full"
              >
              ${schoolInfo.logo2 ? '<p class="text-sm text-muted-foreground mt-1">Current logo 2 is set</p>' : ''}
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <button type="button" id="cancel-btn" class="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    `;

    container.querySelector('#school-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = container.querySelector('#school-name').value.trim();
      const address = container.querySelector('#school-address').value.trim();
      const logo1File = container.querySelector('#school-logo-1').files[0];
      const logo2File = container.querySelector('#school-logo-2').files[0];

      let logo1 = schoolInfo.logo1;
      let logo2 = schoolInfo.logo2;

      if (logo1File) {
        const reader = new FileReader();
        logo1 = await new Promise(resolve => {
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(logo1File);
        });
      }

      if (logo2File) {
        const reader = new FileReader();
        logo2 = await new Promise(resolve => {
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(logo2File);
        });
      }

      window.storage.saveSchoolInfo({ 
        name, 
        address, 
        logo1, 
        logo2, 
      });
      onSave({ 
        name, 
        address, 
        logo1, 
        logo2, 
      });
    });

    container.querySelector('#close-btn').addEventListener('click', onClose);
    container.querySelector('#cancel-btn').addEventListener('click', onClose);

    return container;
  }

  // Export components to global scope
  window.components = {
    createNavbar,
    createStudentTable,
    createStudentForm,
    createReportCard,
    createSchoolForm
  };
})();
