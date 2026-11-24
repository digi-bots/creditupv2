// Tells the site whether online payment is set up and which provider is used. Never returns secret values.
const { provider, missingEnv, isSandbox } = require('../_lib/pay');
module.exports = (req, res) => {
  const missing = missingEnv();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ configured: missing.length === 0, provider: provider(), sandbox: provider() === 'sslcommerz' ? isSandbox() : false, missing });
};
