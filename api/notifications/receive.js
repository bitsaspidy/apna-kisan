import { handleGetUserNotifications } from '../../controllers/notificationController';
import authMiddleware from '../../middleware/authMiddleware';
import translateMiddleware from '../../middleware/translateMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Run auth middleware
      await new Promise((resolve, reject) => {
        authMiddleware(req, res, (result) => {
          if (result instanceof Error) return reject(result);
          return resolve();
        });
      });

      // Run translate middleware
      await new Promise((resolve, reject) => {
        translateMiddleware(req, res, (result) => {
          if (result instanceof Error) return reject(result);
          return resolve();
        });
      });

       // Extract userId from dynamic route param
      // const { userId } = req.query;
      // req.params = { userId };

      return handleGetUserNotifications(req, res);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(200).json({ message: 'Server error', error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(200).end(`Method ${req.method} Not Allowed`);
}
