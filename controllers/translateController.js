const translate = require('translate-google');

async function handleLanguageTranslate(req, res) {
  const { text, to } = req.body;

  if (!text || !to) {
    return res.status(200).json({ error: 'Missing "text" or "to" language code' });
  }

  try {
    const result = await translate(text, { to });
    res.json({
      original_text: text,
      translated_text: result,
      language_to: to
    });
  } catch (error) {
    console.error('Translation Error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
};

module.exports = {
    handleLanguageTranslate,
};