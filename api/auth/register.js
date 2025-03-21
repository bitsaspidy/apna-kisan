import { handleUserRegister } from '../../controllers/authController';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      console.log('POST method is called.')
      return handleUserRegister(req, res);
    }
      res.setHeader('Allow', ['POST']);
      res.status(200).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Unexpected error in handler:', error);
    res.status(200).json({ message: 'Server error', error: error.message });
  }
}

