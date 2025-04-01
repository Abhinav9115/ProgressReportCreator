/**
 * Report generation utilities for the Report Card Generator
 * Handles calculation of grades, percentages, and PDF generation 
 */
(function() {
  /**
   * @typedef {Object} SubjectResult
   * @property {number} session1 - First session marks
   * @property {number} halfYearly - Half yearly exam marks
   * @property {number} session2 - Second session marks
   * @property {number} final - Final exam marks
   * @property {number} total - Total marks
   * @property {string} grade - Overall grade
   */

  /**
   * @typedef {Object} ReportCardData
   * @property {string} id - Student ID
   * @property {string} name - Student name
   * @property {string} fatherName - Father's name
   * @property {string} admissionNumber - Admission number
   * @property {string} class - Class/grade
   * @property {string} section - Section
   * @property {string} rollNo - Roll number (usually same as admission number)
   * @property {Record<string, SubjectResult>} subjects - Subject results
   * @property {number} totalMarks - Total marks obtained
   * @property {number} totalPossibleMarks - Maximum possible marks
   * @property {number} percentage - Overall percentage
   * @property {string} overallGrade - Overall grade
   * @property {string} [remarks] - Teacher's remarks
   * @property {Object} examTotals - Totals for each exam period
   * @property {number} examTotals.session1 - Total marks in Session 1 across all subjects
   * @property {number} examTotals.halfYearly - Total marks in Half Yearly across all subjects
   * @property {number} examTotals.session2 - Total marks in Session 2 across all subjects
   * @property {number} examTotals.final - Total marks in Final across all subjects
   */

  /**
   * Calculate total marks for a subject
   * @param {Object} marks - Subject marks
   * @returns {number} Total marks
   */
  function getSubjectTotal(marks) {
    return marks.session1 + marks.halfYearly + marks.session2 + marks.final;
  }

  /**
   * Get grade based on percentage
   * @param {number} percentage - Percentage score
   * @returns {string} Letter grade
   */
  function getGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  /**
   * Calculate result for a subject including total and grade
   * @param {Object} marks - Subject marks
   * @returns {SubjectResult} Subject result with total and grade
   */
  function calculateSubjectResult(marks) {
    const total = getSubjectTotal(marks);
    const maxPossible = 100;
    const percentage = (total / maxPossible) * 100;

    return {
      ...marks,
      total,
      grade: getGrade(percentage)
    };
  }

  /**
   * Generate remarks based on overall percentage
   * @param {number} percentage - Overall percentage
   * @returns {string} Appropriate remarks
   */
  function getRemarks(percentage) {
    if (percentage >= 90) return 'Outstanding performance! Keep up the excellent work.';
    if (percentage >= 80) return 'Excellent work throughout the year!';
    if (percentage >= 70) return 'Very good performance. Continue the hard work.';
    if (percentage >= 60) return 'Good performance with room for improvement.';
    if (percentage >= 50) return 'Satisfactory performance. Need to focus more on studies.';
    if (percentage >= 40) return 'Fair performance. Significant improvement needed.';
    return 'Needs considerable improvement in all subjects.';
  }

  /**
   * Calculate total marks for each exam period across all subjects
   * @param {Object} subjects - All subject results
   * @returns {Object} Totals for each exam period
   */
  function calculateExamTotals(subjects) {
    const examTotals = {
      session1: 0,
      halfYearly: 0,
      session2: 0,
      final: 0
    };

    Object.values(subjects).forEach(subjectResult => {
      examTotals.session1 += subjectResult.session1;
      examTotals.halfYearly += subjectResult.halfYearly;
      examTotals.session2 += subjectResult.session2;
      examTotals.final += subjectResult.final;
    });

    return examTotals;
  }

  /**
   * Generate complete report card data from student data
   * @param {Object} student - Student data
   * @returns {ReportCardData} Report card data
   */
  function generateReportCardData(student) {
    // Process all subjects
    const subjectResults = {};
    Object.entries(student.subjects).forEach(([subject, marks]) => {
      subjectResults[subject] = calculateSubjectResult(marks);
    });

    // Calculate overall stats
    const totalMarks = Object.values(subjectResults).reduce((sum, subject) => sum + subject.total, 0);
    const subjectCount = Object.keys(student.subjects).length;
    const totalPossibleMarks = subjectCount * 100;
    const percentage = (totalMarks / totalPossibleMarks) * 100;

    // Calculate exam totals
    const examTotals = calculateExamTotals(subjectResults);

    return {
      ...student,
      rollNo: student.admissionNumber,
      subjects: subjectResults,
      totalMarks,
      totalPossibleMarks,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
      overallGrade: getGrade(percentage),
      remarks: getRemarks(percentage),
      examTotals
    };
  }

  /**
   * Format a date string for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  function formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  }

  /**
   * Generate PDF report card for a student
   * @param {ReportCardData} reportData - Report card data
   * @param {boolean} [returnDoc=false] - Whether to return the PDF document instead of saving it
   * @returns {jsPDF|void} The PDF document if returnDoc is true, otherwise void
   */
  function generatePDF(reportData, returnDoc = false) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const schoolInfo = window.storage.getSchoolInfo();

      // Set white background for the PDF
      doc.setFillColor(255, 255, 255);
      doc.rect(
        0, 
        0, 
        doc.internal.pageSize.width, 
        doc.internal.pageSize.height, 
        'F'
      );

      // Add school logos if they exist
      if (schoolInfo.logo1) {
        const logo1Img = new Image();
        logo1Img.src = schoolInfo.logo1;
        doc.addImage(logo1Img, 'PNG', 10, 5, 25, 25);
      }

      if (schoolInfo.logo2) {
        const logo2Img = new Image();
        logo2Img.src = schoolInfo.logo2;
        doc.addImage(logo2Img, 'PNG', 180, 5, 25, 25);
      }

      // Header background
      doc.setFillColor('#ADD8E6');
      doc.roundedRect(35, 8, 140, 40, 5, 5, 'F');

      // Set up document
      doc.setFont('times', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(0, 51, 102);

      // Header
      doc.text('STUDENT REPORT CARD', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`Academic Year: 2024-2025`, 105, 30, { align: 'center' });

      // School information
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text(schoolInfo.name, 105, 40, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(schoolInfo.address || 'School Address', 105, 45, { align: 'center' });

      // Add divider
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.5);
      doc.line(20, 50, 190, 50);
      doc.setDrawColor('#808080');
      doc.line(5, 5, 5, 292);
      doc.line(5, 5, 205, 5);
      doc.line(205, 5, 205, 292);
      doc.line(5, 292, 205, 292);

      // Student information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      const studentInfo = [
        ['Name:', reportData.name, 'Class:', `${reportData.class} - ${reportData.section}`],
        ['Father\'s Name:', reportData.fatherName, 'Roll No:', reportData.rollNo],
        ['Admission No:', reportData.admissionNumber, 'Date of Birth:', formatDate(reportData.dob) || 'N/A']
      ];

      let yPos = 60;
      studentInfo.forEach(row => {
        doc.setFont('helvetica', 'bold');
        doc.text(row[0], 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], 65, yPos);

        doc.setFont('helvetica', 'bold');
        doc.text(row[2], 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(row[3], 150, yPos);

        yPos += 8;
      });

      // Add divider
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 10;

      // Marks table
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

      // Table headers
      const tableHeaders = [
        ['Subject', 'Session 1', 'Half Yearly', 'Session 2', 'Final', 'Total', 'Grade']
      ];

      // Table data
      const tableData = Object.entries(reportData.subjects).map(([subject, marks]) => [
        subjectLabels[subject] || subject,
        marks.session1.toString(),
        marks.halfYearly.toString(),
        marks.session2.toString(),
        marks.final.toString(),
        marks.total.toString(),
        marks.grade
      ]);

      // Add summary row with exam totals
      tableData.push([
        'OVERALL',
        reportData.examTotals.session1.toString(),
        reportData.examTotals.halfYearly.toString(),
        reportData.examTotals.session2.toString(),
        reportData.examTotals.final.toString(),
        reportData.totalMarks.toString(),
        reportData.overallGrade
      ]);

      // Generate the table
      doc.autoTable({
        head: tableHeaders,
        body: tableData,
        startY: yPos,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        styles: {
          cellPadding: 3,
          fontSize: 10,
          lineColor: [100, 100, 100],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          5: { fontStyle: 'bold' },
          6: { fontStyle: 'bold' }
        },
        foot: [
          [
            {
              content: `Percentage: ${reportData.percentage}%`,
              colSpan: 7,
              styles: { fontStyle: 'bold', halign: 'right' }
            }
          ]
        ]
      });

      // Get the y position after the table
      yPos = doc.lastAutoTable.finalY + 10;

      // Remarks section
      doc.setFont('helvetica', 'bold');
      doc.text('Remarks:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(reportData.remarks || '', 50, yPos);

      // Signatures
      yPos += 20;
      doc.setFontSize(10);
      doc.text('Class Teacher', 40, yPos);
      doc.text('Principal', 160, yPos);

      // If returnDoc is true, return the document instead of saving it
      if (returnDoc) {
        return doc;
      }

      // Save the PDF
      doc.save(`${reportData.name}_report_card.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }

  // Export report utilities to global scope
  window.reportUtils = {
    generateReportCardData,
    generatePDF,
    getGrade,
    formatDate,
    calculateExamTotals
  };
})();
