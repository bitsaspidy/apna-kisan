import { updateInventory } from '../../../controllers/inventoryController';
import authMiddleware from '../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      // Run auth middleware
      await new Promise((resolve, reject) => {
        authMiddleware(req, res, (result) => {
          if (result instanceof Error) return reject(result);
          return resolve();
        });
      });

      // Extract :inventoryId param from dynamic route
      const { inventoryId } = req.query;
      req.params = { inventoryId }; // mimic express req.params

      return updateInventory(req, res);
    } catch (error) {
      console.error('Error in inventory update:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
