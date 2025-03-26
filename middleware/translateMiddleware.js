const translateText = require('../utils/translateText');

const translateMiddleware = (req, res, next) => {
  const userLang = req.headers['accept-language'] || 'en'; // Default to English
  const originalJson = res.json;

  res.json = async (data) => {
    if (userLang === 'en') {
      return originalJson.call(res, data); // No translation needed
    }

    const translatedData = await translateResponse(data, userLang);
    originalJson.call(res, translatedData);
  };

  next();
};

// Helper function to recursively translate response data
// const translateResponse = async (data, lang) => {
//   if (Array.isArray(data)) {
//     return Promise.all(data.map(item => translateResponse(item, lang)));
//   }

//   if (typeof data === 'object' && data !== null) {
//     const translatedObj = {};
//     for (const [key, value] of Object.entries(data)) {
//       translatedObj[key] = await translateResponse(value, lang);
//     }
//     return translatedObj;
//   }

//   if (typeof data === 'string') {
//     return await translateText(data, lang);
//   }

//   return data;
// };

const translateResponse = async (data, lang) => {
  // Handle arrays recursively
  if (Array.isArray(data)) {
    return Promise.all(data.map(item => translateResponse(item, lang)));
  }

  // Handle plain objects (not ObjectId or Date)
  if (typeof data === 'object' && data !== null) {
    // Skip special object types (like ObjectId, Date, Buffer, etc.)
    if (
      data instanceof Date ||
      data instanceof Buffer ||
      (data._bsontype && (data._bsontype === 'ObjectID' || data._bsontype === 'Decimal128'))
    ) {
      return data; // Leave it as-is
    }

    const translatedObj = {};
    for (const [key, value] of Object.entries(data)) {
      translatedObj[key] = await translateResponse(value, lang);
    }
    return translatedObj;
  }

  // Translate only strings
  if (typeof data === 'string') {
    return await translateText(data, lang);
  }

  // Return other primitive types (number, boolean, null) as-is
  return data;
};

module.exports = translateMiddleware;
