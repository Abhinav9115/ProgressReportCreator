/**
 * Storage utilities for the Report Card Generator 
 * Handles saving and loading student data from localStorage
 */
(function() {
  // Constants
  const STORAGE_KEY = 'report-card-students';
  const SCHOOL_INFO_KEY = 'report-card-school-info';

  /**
   * Get school information
   * @returns {Object} School info
   */
  function getSchoolInfo() {
    try {
      const data = localStorage.getItem(SCHOOL_INFO_KEY);
      return data ? JSON.parse(data) : {
        name: 'Compposite School Banglahakuti',
        address: '',
        logo: null
      };
    } catch (error) {
      console.error('Error loading school info:', error);
      return { name: 'Compposite School Banglahakuti', address: '' };
    }
  }

  /**
   * Save school information
   * @param {Object} info - School information
   */
  function saveSchoolInfo(info) {
    try {
      localStorage.setItem(SCHOOL_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Error saving school info:', error);
    }
  }

  // Data types
  /**
   * @typedef {Object} SubjectMarks
   * @property {number} session1 - First session marks
   * @property {number} halfYearly - Half yearly exam marks
   * @property {number} session2 - Second session marks
   * @property {number} final - Final exam marks
   */

  /**
   * @typedef {Object} Subjects
   * @property {SubjectMarks} hindi - Hindi marks
   * @property {SubjectMarks} english - English marks
   * @property {SubjectMarks} mathematics - Mathematics marks
   * @property {SubjectMarks} science - Science marks
   * @property {SubjectMarks} socialScience - Social Science marks
   * @property {SubjectMarks} environmentalStudies - Environmental Studies marks
   * @property {SubjectMarks} homeScience - Home Science marks
   * @property {SubjectMarks} artMusic - Art & Music marks
   * @property {SubjectMarks} sanskrit - Sanskrit marks
   * @property {SubjectMarks} sports - Sports marks
   */

  /**
   * @typedef {Object} Student
   * @property {string} id - Unique identifier
   * @property {string} name - Student name
   * @property {string} fatherName - Father's name
   * @property {string} admissionNumber - Admission number
   * @property {string} class - Class/grade
   * @property {string} section - Section
   * @property {string} dateAdded - Date added to the system
   * @property {string} [dob] - Date of birth (optional)
   * @property {string} [gender] - Gender (optional)
   * @property {string} [address] - Address (optional)
   * @property {Subjects} subjects - Subject marks
   */

  /**
   * Get students from localStorage
   * @returns {Student[]} Array of students
   */
  function getStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading students from localStorage:', error);
      return [];
    }
  }

  /**
   * Save students to localStorage
   * @param {Student[]} students - Array of students to save
   */
  function saveStudents(students) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
      console.error('Error saving students to localStorage:', error);
    }
  }

  /**
   * Add a new student
   * @param {Student} student - Student to add
   * @returns {Student} Added student with generated ID
   */
  function addStudent(student) {
    const students = getStudents();
    const newStudent = {
      ...student,
      id: generateUniqueId(),
      dateAdded: new Date().toISOString()
    };

    students.push(newStudent);
    saveStudents(students);
    return newStudent;
  }

  /**
   * Update an existing student
   * @param {Student} updatedStudent - Student with updated data
   * @returns {boolean} Success status
   */
  function updateStudent(updatedStudent) {
    const students = getStudents();
    const index = students.findIndex(s => s.id === updatedStudent.id);

    if (index === -1) return false;

    students[index] = updatedStudent;
    saveStudents(students);
    return true;
  }

  /**
   * Delete a student by ID
   * @param {string} id - Student ID to delete
   * @returns {boolean} Success status
   */
  function deleteStudent(id) {
    const students = getStudents();
    const filteredStudents = students.filter(s => s.id !== id);

    if (filteredStudents.length === students.length) return false;

    saveStudents(filteredStudents);
    return true;
  }

  /**
   * Get a student by ID
   * @param {string} id - Student ID to find
   * @returns {Student|undefined} Found student or undefined
   */
  function getStudentById(id) {
    const students = getStudents();
    return students.find(s => s.id === id);
  }

  /**
   * Generate a unique ID for new students
   * @returns {string} Unique ID
   */
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Sort students by specified field
   * @param {Student[]} students - Students to sort
   * @param {string} sortBy - Field to sort by ('name', 'class', 'date')
   * @returns {Student[]} Sorted students
   */
  function sortStudents(students, sortBy) {
    if (!students || !students.length) return [];

    return [...students].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'class':
          // Sort by class, then by section
          return a.class === b.class
            ? a.section.localeCompare(b.section)
            : a.class.localeCompare(b.class);
        case 'date':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return 0;
      }
    });
  }

  /**
   * Create a sample student for testing
   * @returns {Student} Sample student
   */
  function createSampleStudent() {
    const generateSubjectMarks = () => ({
      session1: Math.floor(Math.random() * 11),
      halfYearly: Math.floor(Math.random() * 31),
      session2: Math.floor(Math.random() * 11),
      final: Math.floor(Math.random() * 51)
    });

    const sampleNames = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Singh', 'Raj Malhotra'];
    const sampleFatherNames = ['Mr. Vikram Sharma', 'Mr. Rajesh Patel', 'Mr. Suresh Kumar', 'Mr. Harish Singh', 'Mr. Vijay Malhotra'];
    const randomIndex = Math.floor(Math.random() * sampleNames.length);

    return {
      id: generateUniqueId(),
      name: sampleNames[randomIndex],
      fatherName: sampleFatherNames[randomIndex],
      admissionNumber: 'A' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      class: String(Math.floor(Math.random() * 12) + 1),
      section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      dateAdded: new Date().toISOString(),
      subjects: {
        hindi: generateSubjectMarks(),
        english: generateSubjectMarks(),
        mathematics: generateSubjectMarks(),
        science: generateSubjectMarks(),
        socialScience: generateSubjectMarks(),
        environmentalStudies: generateSubjectMarks(),
        homeScience: generateSubjectMarks(),
        artMusic: generateSubjectMarks(),
        sanskrit: generateSubjectMarks(),
        sports: generateSubjectMarks()
      }
    };
  }


  /**
   * Add a sample student to the database
   * @returns {Student} Added sample student
   */
  function addSampleStudent() {
    const sampleStudent = createSampleStudent();
    return addStudent(sampleStudent);
  }

  // Export storage utilities to global scope
  window.storage = {
    getStudents,
    saveStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    sortStudents,
    addSampleStudent,
    getSchoolInfo,
    saveSchoolInfo
  };
})();
