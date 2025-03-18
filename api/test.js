export default async function handler(req, res) {
    res.status(200).json({ mongoUri: process.env.MONGODB_URI });
  }