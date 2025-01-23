// Switch light/dark mode
document.addEventListener('DOMContentLoaded', () => {
  const lightModeButton = document.getElementById('lightMode');
  const darkModeButton = document.getElementById('darkMode');
  
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    document.documentElement.setAttribute('data-bs-theme', storedTheme);
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }

  const changeTheme = (theme) => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  };

  lightModeButton.addEventListener('click', () => {
    changeTheme('light');
  });

  darkModeButton.addEventListener('click', () => {
    changeTheme('dark');
  });
});
