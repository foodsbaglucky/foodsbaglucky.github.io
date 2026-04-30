async function loadLabels() {
  const res = await fetch('labels.xml');
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/xml');

  const map = {};
  Array.from(doc.getElementsByTagName('label')).forEach(el => {
    map[el.getAttribute('id')] = el.textContent;
  });

  Object.entries(map).forEach(([key, value]) => {
    if (key.startsWith('color.')) {
      document.documentElement.style.setProperty('--' + key.replace(/\./g, '-'), value);
    }
  });

  document.querySelectorAll('[data-label]').forEach(el => {
    const key = el.dataset.label;
    if (map[key] === undefined) return;
    if (el.dataset.labelAttr) {
      el.setAttribute(el.dataset.labelAttr, map[key]);
    } else {
      el.textContent = map[key];
    }
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

document.addEventListener('DOMContentLoaded', loadLabels);
