(() => {
  const root = document.documentElement;
  const year = document.getElementById('year');
  const themeToggle = document.getElementById('theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const copyClone = document.getElementById('copy-clone');
  const cloneCommand = document.getElementById('clone-command');
  const copyStatus = document.getElementById('copy-status');
  const themeKey = 'mikveh-site-theme';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const themeOrder = ['system', 'light', 'dark'];
  const themeNames = { system: 'System', light: 'Light', dark: 'Dark' };

  if (year) year.textContent = String(new Date().getFullYear());

  const isValidTheme = (value) => themeOrder.includes(value);
  const isDarkTheme = () => root.dataset.theme === 'dark' || (root.dataset.theme === 'system' && systemDark.matches);

  const setTheme = (value) => {
    const theme = isValidTheme(value) ? value : 'system';
    root.dataset.theme = theme;

    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      // Theme selection still applies for this page session.
    }

    const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length];
    themeToggle?.setAttribute('aria-label', `Theme: ${themeNames[theme]}. Activate to switch to ${themeNames[nextTheme]} theme.`);
    themeToggle?.setAttribute('title', `Theme: ${themeNames[theme]} (click for ${themeNames[nextTheme]})`);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', isDarkTheme() ? '#101010' : '#f1f1f1');
  };

  let savedTheme = 'system';
  try {
    const storedTheme = localStorage.getItem(themeKey);
    if (isValidTheme(storedTheme)) savedTheme = storedTheme;
  } catch {
    // Follow the operating-system theme when storage is unavailable.
  }
  setTheme(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = root.dataset.theme || 'system';
    const next = themeOrder[(themeOrder.indexOf(current) + 1) % themeOrder.length];
    setTheme(next);
  });

  systemDark.addEventListener?.('change', () => {
    if (root.dataset.theme === 'system') {
      const themeColor = document.querySelector('meta[name="theme-color"]');
      themeColor?.setAttribute('content', isDarkTheme() ? '#101010' : '#f1f1f1');
    }
  });

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    };

    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !expanded);
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 761px)').addEventListener?.('change', closeMenu);
  }

  const repositoryUrl = typeof window.MIKVEH_CONFIG?.repositoryUrl === 'string'
    ? window.MIKVEH_CONFIG.repositoryUrl.trim()
    : '';
  const cloneText = repositoryUrl
    ? `git clone ${repositoryUrl}`
    : 'git clone https://github.com/darshseraphic/Mikveh.git';

  if (cloneCommand) cloneCommand.textContent = cloneText;

  copyClone?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cloneText);
      if (copyStatus) copyStatus.textContent = 'Git clone command copied.';
      copyClone.setAttribute('aria-label', 'Git clone command copied');
    } catch {
      if (copyStatus) copyStatus.textContent = 'Copy unavailable. Select and copy the command manually.';
    }

    window.setTimeout(() => {
      if (copyStatus) {
        copyStatus.textContent = repositoryUrl
          ? 'Use the repository URL above to clone the source.'
          : 'Repository URL will be added here when published.';
      }
      copyClone.setAttribute('aria-label', 'Copy git clone command');
    }, 2600);
  });
})();
