# Report Card Generator - GitHub Pages Version

This folder contains a standalone version of the Report Card Generator application optimized for GitHub Pages deployment. This version uses pure HTML, CSS, and JavaScript without any build tools or server requirements.

Visit on https://abhinav9115.github.io/ProgressReportCreator/

## Features

- Add and manage student information
- Enter and store student marks for various subjects
- Generate and view formatted report cards
- Download report cards as PDF documents
- Dark/Light theme toggle
- Sample student generation for testing
- Data persistence through LocalStorage

## How to Deploy to GitHub Pages

1. **Create a New Repository**
   - Go to GitHub and create a new repository

2. **Upload All Files**
   - Upload all the files in this folder to the repository
   - Ensure the structure is maintained with the assets folder containing all JavaScript and CSS files

3. **Enable GitHub Pages**
   - Go to the repository settings
   - Scroll down to the GitHub Pages section
   - Select the main branch as the source
   - Click Save

4. **Access Your Deployed Site**
   - After a few minutes, your site will be available at `https://[your-username].github.io/[repository-name]/`

## Technical Notes

- This version uses LocalStorage for data persistence, so all data is stored in the user's browser
- The application uses FontAwesome for icons and Google Fonts for typography
- PDF generation is handled by jsPDF library
- The dark/light mode toggle uses the system's preference by default with the ability to override

## Files Structure

- `index.html` - Main HTML file
- `assets/` - Contains all JavaScript and CSS files
  - `style.css` - Main stylesheet
  - `theme.js` - Theme management functionality
  - `storage.js` - Data storage utilities using LocalStorage
  - `components.js` - UI components creation
  - `reportUtils.js` - Report generation and PDF export utilities
  - `app.js` - Main application logic and routing

## Local Development

To develop locally, simply open the `index.html` file in your browser. No server or build tools are required.

## License

MIT
