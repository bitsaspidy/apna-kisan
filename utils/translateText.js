const translate = require('translate-google');

const translateText = async (text, targetLang) => {
  if (!text || !targetLang || targetLang === 'en') {
    return text; // No need to translate if no text or already English
  }

  try {
    const result = await translate(text, { to: targetLang });
    return result;
  } catch (error) {
    console.error('Translation Error:', error);
    return text; // Fallback to original text if translation fails
  }
};

module.exports = translateText;