import { handleDeleteProductCategory } from '../../../../controllers/productCategoryController';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { categoryId } = req.query;
    req.params = { categoryId };

    return handleDeleteProductCategory(req, res);
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(200).end(`Method ${req.method} Not Allowed`);
}
