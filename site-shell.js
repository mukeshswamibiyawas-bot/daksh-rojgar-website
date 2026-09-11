(() => {
  const year = document.getElementById('year') || document.getElementById('currentYear');
  if (year) year.textContent = new Date().getFullYear();
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('mainNav');
  if (btn && nav) btn.addEventListener('click', () => nav.classList.toggle('open'));
})();
