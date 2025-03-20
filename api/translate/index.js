import { handleLanguageTranslate } from '../../controllers/translateController';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      return handleLanguageTranslate(req, res);
    } catch (error) {
      console.error('Error in translation:', error);
      res.status(200).json({ message: 'Server error', error: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(200).end(`Method ${req.method} Not Allowed`);
}
