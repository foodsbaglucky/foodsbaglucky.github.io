async function loadLabels() {
  const res = await fetch('labels.xml');
  if (!res.ok) { console.error('labels.xml not found:', res.status); return; }
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  if (doc.querySelector('parsererror')) { console.error('labels.xml parse error'); return; }

  const map = {};
  Array.from(doc.getElementsByTagName('label')).forEach(el => {
    map[el.getAttribute('id')] = el.textContent;
  });

  // Set color labels as CSS custom properties
  Object.entries(map).forEach(([key, value]) => {
    if (key.startsWith('color.')) {
      document.documentElement.style.setProperty('--' + key.replace(/\./g, '-'), value);
    }
  });

  // Replace labels.xxx text nodes with values from XML
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while (node = walker.nextNode()) nodes.push(node);
  nodes.forEach(node => {
    const text = node.textContent.trim();
    if (text.startsWith('labels.')) {
      const key = text.slice(7);
      if (map[key] !== undefined) node.textContent = map[key];
    }
  });

  // Handle placeholder attribute
  document.querySelectorAll('[placeholder^="labels."]').forEach(el => {
    const key = el.getAttribute('placeholder').slice(7);
    if (map[key] !== undefined) el.setAttribute('placeholder', map[key]);
  });
}

function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('waitlist-form');
  const input = form.querySelector('input[type="email"]');
  const error = document.getElementById('form-error');
  const success = document.getElementById('form-success');

  if (!input.value || !input.value.includes('@')) {
    error.style.display = 'block';
    return;
  }

  error.style.display = 'none';

  fetch(form.action, {
    method: 'POST',
    mode: 'no-cors',
    body: new FormData(form)
  }).then(() => {
    form.style.display = 'none';
    success.style.display = 'block';
  }).catch(() => {
    form.style.display = 'none';
    success.style.display = 'block';
  });
}

document.querySelectorAll('[data-e]').forEach(el => {
  el.href = 'mailto:' + atob(el.dataset.e);
});

loadLabels().catch(err => console.error('loadLabels failed:', err));
