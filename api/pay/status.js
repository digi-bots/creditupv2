// Tells the site whether online payment is set up. Never returns secret values.
const { missingEnv, isSandbox } = require('../_lib/pay');
module.exports = (req, res) => {
  const missing = missingEnv();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ configured: missing.length === 0, sandbox: isSandbox(), missing });
};
