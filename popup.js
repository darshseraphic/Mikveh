const API_BASE = 'https://bible-api.com';
const RANDOM_VERSE_URL = `${API_BASE}/data/web/random`;

const elements = {
  themeButton: document.getElementById('theme-button'),
  themeIcon: document.getElementById('theme-icon'),
  searchForm: document.getElementById('search-form'),
  referenceInput: document.getElementById('reference-input'),
  clearSearch: document.getElementById('clear-search'),
  searchButton: document.getElementById('search-button'),
  searchMessage: document.getElementById('search-message'),
  verseCard: document.getElementById('verse-card'),
  resultKind: document.getElementById('result-kind'),
  verseReference: document.getElementById('verse-reference'),
  verseText: document.getElementById('verse-text'),
  verseStatus: document.getElementById('verse-status'),
  copyButton: document.getElementById('copy-button'),
  randomButton: document.getElementById('random-button')
};

let currentVerse = null;
let activeRequest = null;
let copyResetTimer = null;
let currentTheme = 'system';
const THEME_ORDER = ['system', 'light', 'dark'];
const THEME_LABELS = { system: 'System', light: 'Light', dark: 'Dark' };
const THEME_ICONS = {
  system: '<rect x="2.8" y="3.5" width="14.4" height="10.5" rx="1.5"/><path d="M7 17h6m-3-3v3"/>',
  light: '<circle cx="10" cy="10" r="3.3"/><path d="M10 1.8v2m0 12.4v2M1.8 10h2m12.4 0h2M4.2 4.2l1.4 1.4m8.8 8.8 1.4 1.4m0-11.6-1.4 1.4m-8.8 8.8-1.4 1.4"/>',
  dark: '<path d="M16.8 12.4A7.2 7.2 0 0 1 7.6 3.2 7.4 7.4 0 1 0 16.8 12.4Z"/>'
};

function setTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme;
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  currentTheme = theme;
  elements.themeIcon.innerHTML = THEME_ICONS[theme];
  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
  const accessibleLabel = `Theme: ${THEME_LABELS[theme]}. Activate to switch to ${THEME_LABELS[nextTheme]} theme.`;
  elements.themeButton.setAttribute('aria-label', accessibleLabel);
  elements.themeButton.title = `Theme: ${THEME_LABELS[theme]} (click for ${THEME_LABELS[nextTheme]})`;
}

async function loadTheme() {
  let theme = 'system';
  try {
    // Preserve a previously saved theme from the earlier branded build.
    const result = await chrome.storage.local.get(['mikvehTheme', 'versebookTheme']);
    const storedTheme = result.mikvehTheme || result.versebookTheme;
    if (['system', 'light', 'dark'].includes(storedTheme)) {
      theme = storedTheme;
    }
  } catch (error) {
    // The system theme remains available if extension storage cannot be read.
  }
  setTheme(theme);
}

async function saveTheme(theme) {
  setTheme(theme);
  try {
    await chrome.storage.local.set({ mikvehTheme: theme });
  } catch (error) {
    // Theme still applies for this popup session if storage is unavailable.
  }
}

function setBusy(isBusy, message = '') {
  elements.verseCard.setAttribute('aria-busy', String(isBusy));
  elements.searchButton.disabled = isBusy;
  elements.randomButton.disabled = isBusy;
  elements.searchButton.querySelector('span').textContent = isBusy ? 'Loading…' : 'Read verse';
  elements.verseStatus.textContent = message;
}

function renderVerse(verse, kind = 'RANDOM VERSE') {
  currentVerse = {
    reference: verse.reference,
    text: verse.text.trim()
  };
  elements.resultKind.textContent = kind;
  elements.verseReference.textContent = verse.reference;
  elements.verseText.textContent = verse.text.trim();
  elements.verseText.classList.remove('is-placeholder');
  elements.copyButton.disabled = false;
  elements.copyButton.setAttribute('aria-label', `Copy ${verse.reference}`);
  elements.copyButton.title = `Copy ${verse.reference}`;
  elements.verseCard.setAttribute('aria-busy', 'false');
  elements.verseStatus.textContent = '';
}

function showError(message) {
  currentVerse = null;
  elements.verseReference.textContent = 'Verse unavailable';
  elements.verseText.textContent = message;
  elements.verseText.classList.add('is-placeholder');
  elements.copyButton.disabled = true;
  elements.verseCard.setAttribute('aria-busy', 'false');
  elements.verseStatus.textContent = 'Check the reference or your connection, then try again.';
}

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('The Bible service returned an unreadable response.');
  }

  if (!response.ok) {
    const apiMessage = typeof data?.error === 'string' ? data.error : `Request failed (${response.status}).`;
    throw new Error(apiMessage);
  }
  return data;
}

function parseReference(rawValue) {
  const value = rawValue.trim();
  if (!value) return null;

  // Accept the requested format (Luke 1:37) and the book/chapter:verse
  // format used by bible.js (luke/1:37).
  const slashIndex = value.lastIndexOf('/');
  let book;
  let chapter;
  let verse;

  if (slashIndex > 0) {
    book = value.slice(0, slashIndex).trim();
    const coordinates = value.slice(slashIndex + 1).trim().match(/^(\d+)\s*:\s*(\d+)$/);
    if (!coordinates) return null;
    [, chapter, verse] = coordinates;
  } else {
    const match = value.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)$/);
    if (!match) return null;
    [, book, chapter, verse] = match;
    book = book.trim();
  }

  if (!book || !chapter || !verse || Number(chapter) < 1 || Number(verse) < 1) return null;
  return { book, chapter, verse };
}

async function runRequest(requestFn, kind) {
  if (activeRequest) activeRequest.abort();
  activeRequest = new AbortController();
  const { signal } = activeRequest;
  setBusy(true, '');
  elements.searchMessage.textContent = '';

  try {
    const verse = await requestFn(signal);
    if (signal.aborted) return;
    if (!verse || typeof verse.reference !== 'string' || typeof verse.text !== 'string' || !verse.text.trim()) {
      throw new Error('The Bible service returned incomplete verse data.');
    }
    renderVerse(verse, kind);
  } catch (error) {
    if (error.name === 'AbortError') return;
    showError(error.message || 'Something went wrong while loading this verse.');
  } finally {
    if (!signal.aborted) {
      setBusy(false, elements.verseStatus.textContent);
      activeRequest = null;
    }
  }
}

function loadRandomVerse() {
  return runRequest(async (signal) => {
    const data = await fetchJson(RANDOM_VERSE_URL, signal);
    const randomVerse = data?.random_verse;
    if (!randomVerse?.book || !randomVerse?.chapter || !randomVerse?.verse || !randomVerse?.text) {
      throw new Error('The Bible service did not return a random verse.');
    }
    return {
      reference: `${randomVerse.book} ${randomVerse.chapter}:${randomVerse.verse}`,
      text: randomVerse.text
    };
  }, 'RANDOM VERSE');
}

function searchVerse(rawValue) {
  const parsed = parseReference(rawValue);
  if (!parsed) {
    elements.searchMessage.textContent = 'Use the format Book Chapter:Verse, such as Luke 1:37.';
    elements.referenceInput.focus();
    return;
  }

  const encodedBook = encodeURIComponent(parsed.book);
  const url = `${API_BASE}/${encodedBook}+${parsed.chapter}:${parsed.verse}`;
  elements.searchMessage.textContent = '';
  return runRequest(async (signal) => {
    const data = await fetchJson(url, signal);
    if (!data?.reference || !data?.text) {
      throw new Error('No verse was found for that reference. Check the book, chapter, and verse.');
    }
    return { reference: data.reference, text: data.text };
  }, 'SEARCH RESULT');
}

async function copyCurrentVerse() {
  if (!currentVerse) return;
  const content = `${currentVerse.reference}\n\n${currentVerse.text}`;
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {
    const temporary = document.createElement('textarea');
    temporary.value = content;
    temporary.setAttribute('readonly', '');
    temporary.style.position = 'fixed';
    temporary.style.opacity = '0';
    document.body.appendChild(temporary);
    temporary.select();
    const copied = document.execCommand('copy');
    temporary.remove();
    if (!copied) {
      elements.verseStatus.textContent = 'Copy was not available in this browser.';
      return;
    }
  }

  elements.copyButton.setAttribute('aria-label', 'Verse copied');
  elements.copyButton.title = 'Copied';
  elements.verseStatus.textContent = 'Verse copied to clipboard.';
  window.clearTimeout(copyResetTimer);
  copyResetTimer = window.setTimeout(() => {
    if (currentVerse) {
      elements.copyButton.setAttribute('aria-label', `Copy ${currentVerse.reference}`);
      elements.copyButton.title = `Copy ${currentVerse.reference}`;
      elements.verseStatus.textContent = '';
    }
  }, 1800);
}

elements.searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchVerse(elements.referenceInput.value);
});

elements.referenceInput.addEventListener('input', () => {
  elements.clearSearch.hidden = elements.referenceInput.value.length === 0;
  if (elements.searchMessage.textContent) elements.searchMessage.textContent = '';
});

elements.clearSearch.addEventListener('click', () => {
  elements.referenceInput.value = '';
  elements.clearSearch.hidden = true;
  elements.searchMessage.textContent = '';
  elements.referenceInput.focus();
});

elements.randomButton.addEventListener('click', loadRandomVerse);
elements.copyButton.addEventListener('click', copyCurrentVerse);
elements.themeButton.addEventListener('click', () => {
  const currentIndex = THEME_ORDER.indexOf(currentTheme);
  const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
  saveTheme(nextTheme);
});

(async function init() {
  await loadTheme();
  loadRandomVerse();
})();
