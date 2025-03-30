/**
 * Theme management for the Report Card Generator
 */
(function() {
  // Theme constants
  const STORAGE_KEY = 'report-card-theme';
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  };

  // Get the current theme from localStorage or use default
  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || THEMES.LIGHT;
  }

  // Set the theme and update UI
  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }

  // Apply the chosen theme
  function applyTheme(theme) {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);

    // Determine which theme to apply
    let activeTheme;
    if (theme === THEMES.SYSTEM) {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEMES.DARK
        : THEMES.LIGHT;
    } else {
      activeTheme = theme;
    }

    // Apply the theme
    root.classList.add(activeTheme);
    console.log(`Theme applied: ${activeTheme} (based on ${theme})`);

    // Update theme toggle button if it exists
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    if (themeToggleIcon) {
      const isDark = activeTheme === THEMES.DARK;
      themeToggleIcon.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
  }

  // Toggle between light and dark themes
  function createRipple(event, element) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    element.style.setProperty('--x', `${x - 50}px`);
    element.style.setProperty('--y', `${y - 50}px`);
    element.classList.remove('ripple');
    element.offsetWidth; // Force reflow
    element.classList.add('ripple');
  }

  function toggleTheme(event) {
    const currentTheme = getTheme();
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    if (event && event.currentTarget) {
      createRipple(event, event.currentTarget);
    }
    setTheme(newTheme);
  }

  // Listen for system theme changes
  function setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', () => {
      const currentTheme = getTheme();
      if (currentTheme === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    });
  }

  // Initialize theme on page load
  function initTheme() {
    const savedTheme = getTheme();
    applyTheme(savedTheme);
    setupSystemThemeListener();
  }

  // Export theme functionality to global scope
  window.themeManager = {
    getTheme,
    setTheme,
    toggleTheme,
    THEMES
  };

  // Initialize theme immediately to prevent flashing
  initTheme();
})();
