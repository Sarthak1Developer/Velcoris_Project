import vercelHandler from './index.js';

export default async function handler(req, res) {
  if (req.url && !req.url.startsWith('/api/')) {
    req.url = '/api/enquiries' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  }
  return vercelHandler(req, res);
}
