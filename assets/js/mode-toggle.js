document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('strategy-maker');
  const toggle = document.getElementById('modeToggle');
  toggle.addEventListener('click', () => {
    container.classList.toggle('dark');
    toggle.textContent = container.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
  });
});
