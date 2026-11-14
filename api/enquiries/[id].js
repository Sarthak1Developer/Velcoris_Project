import vercelHandler from '../index.js';

export default async function handler(req, res) {
  if (req.url && !req.url.startsWith('/api/')) {
    const id = req.query?.id || '';
    req.url = '/api/enquiries/' + id + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  }
  return vercelHandler(req, res);
}
