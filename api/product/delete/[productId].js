import { handleDeleteProduct } from '../../../controllers/productController';
import authMiddleware from '../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    const { productId } = req.query;
    req.params = { productId };

    return handleDeleteProduct(req, res);
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(200).end(`Method ${req.method} Not Allowed`);
}
