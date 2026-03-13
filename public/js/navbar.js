(() => {
  const nav = document.querySelector('.navbar-pro');
  const userBox = document.getElementById('userBox');
  const dropdown = document.getElementById('userDropdown');

  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  if (userBox && dropdown) {
    const toggle = () => {
      const isOpen = userBox.classList.toggle('open');
      userBox.setAttribute('aria-expanded', isOpen);
    };

    userBox.addEventListener('click', toggle);
    userBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    document.addEventListener('click', (e) => {
      if (!userBox.contains(e.target)) {
        userBox.classList.remove('open');
        userBox.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
