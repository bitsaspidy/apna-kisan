import { handleAddNewProductCategory } from '../../../controllers/productCategoryController';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleAddNewProductCategory(req, res);
  }

  res.setHeader('Allow', ['POST']);
  res.status(200).end(`Method ${req.method} Not Allowed`);
}
