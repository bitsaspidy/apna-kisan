import { getInventoryByStatus } from '../../controllers/inventoryController';
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

      // Extract :status param from dynamic route
      const { status } = req.query;
      req.params = { status }; // mimic express req.params

      return getInventoryByStatus(req, res);
    } catch (error) {
      console.error('Error in inventory [status]:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
