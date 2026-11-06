const stamp = () => new Date().toISOString();

const logger = {
  info: (msg) => console.log(`[${stamp()}] INFO  ${msg}`),
  warn: (msg) => console.warn(`[${stamp()}] WARN  ${msg}`),
  error: (msg, err) => console.error(`[${stamp()}] ERROR ${msg}`, err ? `\n${err.stack || err}` : ''),
};

module.exports = logger;