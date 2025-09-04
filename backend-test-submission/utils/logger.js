const axios = require('axios');

const LOG_API_URL = process.env.LOG_API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const Log = async (stack, level, package_name, message) => {
  try {
    const logData = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(), 
      package: package_name.toLowerCase(),
      message: message
    };

    console.log(`[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`);
    
    const response = await axios.post(LOG_API_URL, logData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    console.error(`Logging failed: ${error.message}`);
    return null;
  }
};

module.exports = { Log };