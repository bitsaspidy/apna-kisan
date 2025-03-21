import { handleUpdateProductCategory } from '../../../../controllers/productCategoryController';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { categoryId } = req.query; // comes from dynamic file name
    req.params = { categoryId };

    return handleUpdateProductCategory(req, res);
  }

  res.setHeader('Allow', ['PUT']);
  res.status(200).end(`Method ${req.method} Not Allowed`);
}
