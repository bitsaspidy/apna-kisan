import { handleGetAllProducts } from '../../controllers/productController';
import authMiddleware from '../../middleware/authMiddleware';
import translateMiddleware from '../../middleware/translateMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    await new Promise((resolve, reject) => {
      translateMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    return handleGetAllProducts(req, res);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
