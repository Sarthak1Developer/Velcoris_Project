'use strict';
let accessKey = '', page = 1, totalPages = 1, loading = false;
try { accessKey = sessionStorage.getItem('velcoris_admin_key') || localStorage.getItem('velcoris_admin_key') || ''; } catch { }
const list = document.querySelector('#enquiry-list'), errorBox = document.querySelector('#desk-error');
const statusLabels = { new: 'New', in_progress: 'In progress', resolved: 'Resolved' };
function element(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
function headers(json = false) { return { ...(accessKey ? { Authorization: 'Bearer ' + accessKey } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) }; }
function showError(message) { errorBox.textContent = message; errorBox.hidden = false; }
function renderRecord(record) {
  const article = element('article', undefined, 'enquiry-card');
  const heading = element('div', undefined, 'enquiry-heading'); heading.append(element('h2', record.name), element('span', statusLabels[record.status], 'tag'));
  article.append(heading, element('p', 'Reference: ' + record.id, 'record-reference'));
  const meta = element('dl', undefined, 'enquiry-meta');
  for (const [label, value] of [['Email', record.email], ['Organisation', record.organisation || 'Not provided'], ['Purpose', record.intent], ['Material', record.material], ['Created', new Date(record.created_at).toLocaleString()], ['Updated', new Date(record.updated_at).toLocaleString()]]) { const row = element('div'); row.append(element('dt', label), element('dd', value)); meta.append(row); }
  article.append(meta, element('p', record.message, 'enquiry-message'));
  const form = element('form', undefined, 'status-form'), label = element('label', 'Workflow status'), select = element('select'); select.setAttribute('aria-label', 'Status for ' + record.id);
  for (const [value, text] of Object.entries(statusLabels)) { const option = element('option', text); option.value = value; select.append(option); } select.value = record.status; label.append(select);
  const button = element('button', 'Save status', 'button'); button.type = 'submit'; form.append(label, button); article.append(form);
  form.addEventListener('submit', async event => { event.preventDefault(); button.disabled = true; select.disabled = true; errorBox.hidden = true; try { const response = await fetch('/api/enquiries/' + record.id, { method: 'PATCH', headers: headers(true), body: JSON.stringify({ status: select.value, revision: record.revision }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to update the enquiry.'); await load(); } catch (error) { showError(error.message); } finally { button.disabled = false; select.disabled = false; } });
  return article;
}
async function load() {
  if (loading) return; loading = true; errorBox.hidden = true; list.setAttribute('aria-busy', 'true');
  const params = new URLSearchParams({ page: String(page), q: document.querySelector('#search').value, status: document.querySelector('#status-filter').value });
  try {
    const response = await fetch('/api/enquiries?' + params, { headers: headers(), cache: 'no-store' }); const data = await response.json();
    if (response.status === 401) {
      try { sessionStorage.removeItem('velcoris_admin_key'); localStorage.removeItem('velcoris_admin_key'); } catch { }
      document.querySelector('#access-form').hidden = false;
      throw new Error(data.error || 'Administrator access is required.');
    }
    if (!response.ok) throw new Error(data.error || 'Unable to load enquiries.');
    try { if (accessKey) { sessionStorage.setItem('velcoris_admin_key', accessKey); localStorage.setItem('velcoris_admin_key', accessKey); } } catch { }
    document.querySelector('#access-form').hidden = true; totalPages = data.totalPages; list.replaceChildren();
    if (data.enquiries.length) data.enquiries.forEach(record => list.append(renderRecord(record))); else list.append(element('p', 'No enquiries match this search.', 'empty-state'));
    document.querySelector('#record-count').textContent = `${data.total} saved ${data.total === 1 ? 'enquiry' : 'enquiries'} matching your filters`;
    document.querySelector('#page-state').textContent = `Page ${data.page} of ${data.totalPages}`;
    document.querySelector('#previous').disabled = page <= 1; document.querySelector('#next').disabled = page >= totalPages;
  } catch (error) { showError(error instanceof TypeError ? 'Connection failed. Please try refreshing.' : error.message); document.querySelector('#record-count').textContent = 'Enquiries could not be loaded.'; }
  finally { loading = false; list.setAttribute('aria-busy', 'false'); }
}
document.querySelector('#filters').addEventListener('submit', event => { event.preventDefault(); page = 1; load(); });
document.querySelector('#access-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#access-key');
  accessKey = (input.value || '').trim().replace(/^["']|["']$/g, '');
  page = 1;
  load();
});
document.querySelector('#previous').addEventListener('click', () => { if (page > 1) { page--; load(); } });
document.querySelector('#next').addEventListener('click', () => { if (page < totalPages) { page++; load(); } });
load();
