import { handleUserLogin } from '../../../controllers/authController.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleUserLogin(req, res);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
