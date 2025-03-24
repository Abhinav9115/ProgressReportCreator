/**
 * Main application for the Report Card Generator
 * Handles routing and view management
 */
(function() {
  // Application state
  const state = {
    view: 'home', // home, add-student, edit-student, report-card
    selectedStudent: null,
    sortBy: 'name', // name, class, date
    students: []
  };
  
  // Cache DOM references
  let appContainer;
  
  /**
   * Initialize the application
   */
  function init() {
    // Get the app container
    appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('App container not found');
      return;
    }
    
    // Add navbar to page
    const navbar = window.components.createNavbar();
    appContainer.appendChild(navbar);
    
    // Create main content container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'container mx-auto px-4 py-6';
    mainContainer.id = 'main-content';
    appContainer.appendChild(mainContainer);
    
    // Load students from localStorage
    state.students = window.storage.getStudents();
    
    // Render the initial view
    renderView();
  }
  
  /**
   * Render the current view based on application state
   */
  function renderView() {
    const mainContainer = document.getElementById('main-content');
    if (!mainContainer) return;
    
    // Clear current content
    mainContainer.innerHTML = '';
    
    // Render based on current view
    switch (state.view) {
      case 'home':
        renderHome(mainContainer);
        break;
      case 'add-student':
        renderStudentForm(mainContainer, null);
        break;
      case 'edit-student':
        renderStudentForm(mainContainer, state.selectedStudent);
        break;
      case 'report-card':
        renderReportCard(mainContainer);
        break;
      default:
        renderHome(mainContainer);
    }
  }
  
  /**
   * Render the home view with student listing
   * @param {HTMLElement} container - Container to render into
   */
  function renderHome(container) {
    // Add page header
    const header = document.createElement('div');
    header.className = 'mb-6';
    header.innerHTML = `
      <h1 class="text-2xl font-heading font-bold mb-2">Student Report Cards</h1>
      <p class="text-muted-foreground">Manage students and generate report cards</p>
    `;
    container.appendChild(header);
    
    // Sort students based on current sort selection
    const sortedStudents = window.storage.sortStudents(state.students, state.sortBy);
    
    // Add sort controls if we have students
    if (sortedStudents.length > 0) {
      const sortControls = document.createElement('div');
      sortControls.className = 'flex items-center space-x-2 mb-4';
      sortControls.innerHTML = `
        <span class="text-sm text-muted-foreground">Sort by:</span>
        <div class="flex rounded-md overflow-hidden border border-input">
          <button id="sort-name" class="px-3 py-1 text-sm">Name</button>
          <button id="sort-class" class="px-3 py-1 text-sm">Class</button>
          <button id="sort-date" class="px-3 py-1 text-sm">Date Added</button>
        </div>
      `;
      
      // Highlight active sort button
      sortControls.querySelector(`#sort-${state.sortBy}`).classList.add('bg-primary', 'text-primary-foreground');
      
      // Add sort event listeners
      sortControls.querySelector('#sort-name').addEventListener('click', () => {
        state.sortBy = 'name';
        renderView();
      });
      
      sortControls.querySelector('#sort-class').addEventListener('click', () => {
        state.sortBy = 'class';
        renderView();
      });
      
      sortControls.querySelector('#sort-date').addEventListener('click', () => {
        state.sortBy = 'date';
        renderView();
      });
      
      container.appendChild(sortControls);
    }
    
    // Create student table
    const studentTable = window.components.createStudentTable(sortedStudents, {
      onEdit: (student) => {
        state.selectedStudent = student;
        state.view = 'edit-student';
        renderView();
      },
      onViewReport: (student) => {
        state.selectedStudent = student;
        state.view = 'report-card';
        renderView();
      },
      onDelete: (id) => {
        if (window.storage.deleteStudent(id)) {
          state.students = window.storage.getStudents();
          renderView();
        }
      },
      onAddStudent: () => {
        state.view = 'add-student';
        renderView();
      },
      onAddSampleStudent: () => {
        const newStudent = window.storage.addSampleStudent();
        if (newStudent) {
          state.students = window.storage.getStudents();
          renderView();
        }
      }
    });
    
    container.appendChild(studentTable);
  }
  
  /**
   * Render the student form for adding/editing
   * @param {HTMLElement} container - Container to render into
   * @param {Object|null} student - Student to edit, or null for new student
   */
  function renderStudentForm(container, student) {
    const form = window.components.createStudentForm(student, {
      onBack: () => {
        state.view = 'home';
        renderView();
      },
      onStudentAdded: () => {
        state.students = window.storage.getStudents();
        state.view = 'home';
        renderView();
      }
    });
    
    container.appendChild(form);
  }
  
  /**
   * Render the report card view
   * @param {HTMLElement} container - Container to render into
   */
  function renderReportCard(container) {
    if (!state.selectedStudent) {
      state.view = 'home';
      renderView();
      return;
    }
    
    const reportCard = window.components.createReportCard(state.selectedStudent, {
      onBack: () => {
        state.view = 'home';
        renderView();
      },
      onEdit: () => {
        state.view = 'edit-student';
        renderView();
      },
      onDownload: () => {
        if (state.selectedStudent) {
          const reportData = window.reportUtils.generateReportCardData(state.selectedStudent);
          window.reportUtils.generatePDF(reportData);
        }
      }
    });
    
    // Add download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn ml-3';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
    downloadBtn.onclick = () => {
      if (state.selectedStudent) {
        const reportData = window.reportUtils.generateReportCardData(state.selectedStudent);
        window.reportUtils.generatePDF(reportData);
      }
    };
    
    container.appendChild(reportCard);
    const actionsSpace = reportCard.querySelector('.actions-space');
    if (actionsSpace) {
      actionsSpace.appendChild(downloadBtn);
    }
  }
  
  // Initialize app when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
})();