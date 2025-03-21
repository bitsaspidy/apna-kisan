import { handleGetAllCategory } from '../../../controllers/productCategoryController';
import translateMiddleware from '../../../middleware/translateMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await new Promise((resolve, reject) => {
      translateMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    return handleGetAllCategory(req, res);
  }

  res.setHeader('Allow', ['GET']);
  res.status(200).end(`Method ${req.method} Not Allowed`);
}
