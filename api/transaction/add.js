import dbConnect from '../../lib/mongodb';
import authMiddleware from '../../middleware/authMiddleware';
import { handleAddTransactionDetail } from '../../controllers/transactionController';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(200).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Run auth middleware (promisified)
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    await dbConnect(); // optional if needed for database ops
    return handleAddTransactionDetail(req, res);

  } catch (error) {
    console.error('Error in Add Transaction:', error);
    return res.status(200).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
}