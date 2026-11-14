import vercelHandler from './index.js';

export default async function handler(req, res) {
  if (req.url && !req.url.startsWith('/api/')) {
    const slug = req.query?.slug;
    const pathStr = Array.isArray(slug) ? slug.join('/') : slug || '';
    req.url = '/api/' + pathStr + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  }
  return vercelHandler(req, res);
}
