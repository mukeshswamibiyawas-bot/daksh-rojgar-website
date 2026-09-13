(() => {
  const year = document.getElementById('year') || document.getElementById('currentYear');
  if (year) year.textContent = new Date().getFullYear();

  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('mainNav');
  if (btn && nav) btn.addEventListener('click', () => nav.classList.toggle('open'));

  const addRajasthanInfoLinks = () => {
    if (nav && !nav.querySelector('a[href="listing.html?module=rajasthan_info"]')) {
      const link = document.createElement('a');
      link.href = 'listing.html?module=rajasthan_info';
      link.textContent = 'Rajasthan Info';

      const photoLink = nav.querySelector('a[href*="photo-"]');
      if (photoLink) nav.insertBefore(link, photoLink);
      else nav.appendChild(link);
    }

    document.querySelectorAll('.dr-footer-inner > div').forEach((section) => {
      const heading = section.querySelector('h4');
      if (!heading || heading.textContent.trim() !== 'Resources') return;
      if (section.querySelector('a[href="listing.html?module=rajasthan_info"]')) return;

      const link = document.createElement('a');
      link.href = 'listing.html?module=rajasthan_info';
      link.textContent = 'Rajasthan Info';

      const photoLink = section.querySelector('a[href*="photo-"]');
      if (photoLink) section.insertBefore(link, photoLink);
      else section.appendChild(link);
    });
  };

  addRajasthanInfoLinks();
})();
