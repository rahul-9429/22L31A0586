const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const { connectDB } = require('./lib/db.js');
const Url = require('./models/Url.js');
const Analytics = require('./models/Analytics.js');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url}`);
  console.log(`  User-Agent: ${userAgent}`);
  console.log(`  IP: ${ip}`);
  console.log('  ----------------------------------------');
  
  next();
};

app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(loggingMiddleware);

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const generateShortCode = () => {
  return nanoid(6);
};

const isExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};
 
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'URL Shortener Microservice',
    database: mongoose.connections[0].readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

app.post('/api/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    
    console.log(`Creating short URL for: ${url}`);
    
    if (!url) {
      console.log(`ERROR: URL is required`);
      return res.status(400).json({ 
        error: 'URL is required',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!isValidUrl(url)) {
      console.log(`ERROR: Invalid URL format - ${url}`);
      return res.status(400).json({ 
        error: 'Invalid URL format',
        timestamp: new Date().toISOString()
      });
    }
    
    if (validity && (!Number.isInteger(validity) || validity <= 0)) {
      console.log(`ERROR: Invalid validity - ${validity}`);
      return res.status(400).json({ 
        error: 'Validity must be a positive integer (minutes)',
        timestamp: new Date().toISOString()
      });
    }
    
    let finalShortcode = shortcode;
    
    if (shortcode) {
      if (!/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
        console.log(`ERROR: Invalid shortcode format - ${shortcode}`);
        return res.status(400).json({ 
          error: 'Shortcode must be alphanumeric and 3-20 characters long',
          timestamp: new Date().toISOString()
        });
      }
      
      const existingUrl = await Url.findOne({ shortcode });
      if (existingUrl) {
        console.log(`ERROR: Shortcode already exists - ${shortcode}`);
        return res.status(409).json({ 
          error: 'Shortcode already exists',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      do {
        finalShortcode = generateShortCode();
      } while (await Url.findOne({ shortcode: finalShortcode }));
    }
    
    const expiryDate = new Date(Date.now() + validity * 60 * 1000);
    
    const urlData = new Url({
      originalUrl: url,
      shortcode: finalShortcode,
      expiryDate: expiryDate,
      clickCount: 0
    });
    
    await urlData.save();
    
    console.log(`SUCCESS: Created shortcode ${finalShortcode} for ${url}`);
    console.log(`Expires: ${expiryDate.toISOString()}`);
    
    res.status(201).json({
      shortLink: `http://localhost:${PORT}/${finalShortcode}`,
      expiry: expiryDate.toISOString(),
      shortcode: finalShortcode
    });
    
  } catch (error) {
    console.error(`Error creating short URL:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    console.log(`Redirect request for shortcode: ${shortcode}`);
    
    const urlData = await Url.findOne({ shortcode, isActive: true });
    
    if (!urlData) {
      console.log(`ERROR: Shortcode not found - ${shortcode}`);
      return res.status(404).json({ 
        error: 'Short URL not found',
        timestamp: new Date().toISOString()
      });
    }
    
    if (isExpired(urlData.expiryDate)) {
      console.log(`ERROR: Shortcode expired - ${shortcode}`);
      return res.status(410).json({ 
        error: 'Short URL has expired',
        timestamp: new Date().toISOString()
      });
    }
    
    await Url.findOneAndUpdate(
      { shortcode },
      { $inc: { clickCount: 1 } }
    );
    
    const analyticsData = new Analytics({
      shortcode,
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip: req.ip || req.connection.remoteAddress || 'Unknown',
      location: 'Unknown'
    });
    
    await analyticsData.save();
    
    console.log(`SUCCESS: Redirecting ${shortcode} to ${urlData.originalUrl}`);
    console.log(`Total clicks for ${shortcode}: ${urlData.clickCount + 1}`);
    
    res.redirect(urlData.originalUrl);
    
  } catch (error) {
    console.error(`Error redirecting:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    console.log(`Statistics request for shortcode: ${shortcode}`);
    
    const urlData = await Url.findOne({ shortcode });
    
    if (!urlData) {
      console.log(`ERROR: Shortcode not found for stats - ${shortcode}`);
      return res.status(404).json({ 
        error: 'Short URL not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const clickAnalytics = await Analytics.find({ shortcode }).sort({ timestamp: -1 });
    
    console.log(`SUCCESS: Returning stats for ${shortcode} - ${clickAnalytics.length} clicks`);
    
    res.json({
      shortcode,
      originalUrl: urlData.originalUrl,
      shortLink: `http://localhost:${PORT}/${shortcode}`,
      createdAt: urlData.createdAt,
      expiryDate: urlData.expiryDate,
      isExpired: isExpired(urlData.expiryDate),
      totalClicks: urlData.clickCount,
      analytics: clickAnalytics.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer,
        userAgent: click.userAgent,
        ip: click.ip,
        location: click.location
      }))
    });
    
  } catch (error) {
    console.error(`Error fetching statistics:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/urls', async (req, res) => {
  try {
    console.log(`Fetching all URLs from database`);
    
    const allUrls = await Url.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(100);
    
    const urlsWithExpiry = allUrls.map(url => ({
      shortcode: url.shortcode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      expiryDate: url.expiryDate,
      clickCount: url.clickCount,
      shortLink: `http://localhost:${PORT}/${url.shortcode}`,
      isExpired: isExpired(url.expiryDate)
    }));
    
    console.log(`Found ${urlsWithExpiry.length} URLs`);
    
    res.json({
      urls: urlsWithExpiry,
      total: urlsWithExpiry.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching all URLs:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`URL Shortener Service started at 2025-09-04 06:42:26`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/`);
  console.log(`Database: MongoDB Atlas`);
});