/**
 * Request logging middleware
 * Logs incoming requests with timing and response information
 */

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Rate limiting helper
 */
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    }
    
    // Check current IP
    const currentRequests = requests.get(key) || [];
    const recentRequests = currentRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= max) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests',
        details: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    next();
  };
};

module.exports = {
  requestLogger,
  createRateLimit
};