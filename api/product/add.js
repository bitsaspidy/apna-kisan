import { handleAddNewProduct } from '../../controllers/productController';
import authMiddleware from '../../middleware/authMiddleware';
import uploadMiddleware from '../../multer/multerconfig';

export const config = {
  api: {
    bodyParser: false, // We need to disable body parsing for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Run auth middleware manually
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });

    // Run multer upload middleware manually
    await new Promise((resolve, reject) => {
      uploadMiddleware.array('images', 5)(req, res, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });

    return handleAddNewProduct(req, res);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
