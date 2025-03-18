import { handleOtpVerification } from '../../controllers/authController';

export default function handler(req, res) {
  if (req.method === 'POST') {
    return handleOtpVerification(req, res);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
