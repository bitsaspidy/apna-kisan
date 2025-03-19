import { handleUpdateProduct } from '../../../controllers/productController';
import authMiddleware from '../../../middleware/authMiddleware';
import upload from '../../../multer/multerconfig';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    await new Promise((resolve, reject) => {
      upload.array('images', 5)(req, res, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });

    const { productId } = req.query; // comes from dynamic file name
    req.params = { productId };

    return handleUpdateProduct(req, res);
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
