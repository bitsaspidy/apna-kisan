// pages/api/transcation/receive.js

import dbConnect from '../../lib/mongodb';
import authMiddleware from '../../middleware/authMiddleware';
import translateMiddleware from '../../middleware/translateMiddleware';
import { handlereceiveTransactionDetail } from '../../controllers/transactionController';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Run auth middleware first
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    // Run translate middleware next
    await new Promise((resolve, reject) => {
      translateMiddleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });

    await dbConnect(); // optional if needed
    return handlereceiveTransactionDetail(req, res);

  } catch (error) {
    console.error('Error in Receive Transaction:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
}