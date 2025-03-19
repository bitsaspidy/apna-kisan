import { handleSendNotification } from '../../controllers/notificationController';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      return handleSendNotification(req, res);
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
