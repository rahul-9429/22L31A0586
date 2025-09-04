const { Log } = require('../utils/logger.js');

const loggingMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  await Log('backend', 'info', 'url-shortener', 
    `${method} ${url} - User-Agent: ${userAgent} - IP: ${ip}`);


  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    Log('backend', statusCode >= 400 ? 'error' : 'info', 'url-shortener',
      `${method} ${url} - ${statusCode} - ${duration}ms`);
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = loggingMiddleware;