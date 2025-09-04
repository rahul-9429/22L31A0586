import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  GitHub as GitHubIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function UrlShortenerPage() {
  const [url, setUrl] = useState('');
  const [validity, setValidity] = useState(30);
  const [shortcode, setShortcode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const validateUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    setResult(null);
    setCopySuccess(false);

    if (!url.trim()) {
      setResult({
        success: false,
        error: "Please enter a URL to shorten!"
      });
      return;
    }

    if (!validateUrl(url)) {
      setResult({
        success: false,
        error: "Please enter a valid URL. Try something like: https://example.com"
      });
      return;
    }

    if (validity <= 0) {
      setResult({
        success: false,
        error: "Validity should be at least 1 minute!"
      });
      return;
    }

    if (shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
      setResult({
        success: false,
        error: "Custom shortcode should be 3-20 characters with only letters and numbers"
      });
      return;
    }

    setLoading(true);

    try {
      console.log(`Creating short URL for: ${url.trim()}`);
      console.log(`Validity: ${validity} minutes`);
      console.log(`Custom shortcode: ${shortcode.trim() || 'auto-generated'}`);

      const response = await axios.post(`${API_BASE}/shorturls`, {
        url: url.trim(),
        validity: Number(validity),
        shortcode: shortcode.trim() || undefined
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`Success! Short URL created:`, response.data);

      setResult({
        success: true,
        data: {
          ...response.data,
          originalUrl: url.trim(),
          customCode: shortcode.trim()
        }
      });

      setUrl('');
      setShortcode('');
      setValidity(30);

    } catch (error) {
      console.error(`Error creating short URL:`, error);
      
      let errorMessage = 'Oops! Something went wrong. Please try again!';
      
      if (error.response) {
        errorMessage = error.response.data?.error || `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Unable to connect to server. Please check if the server is running on localhost:5000';
      } else {
        errorMessage = error.message;
      }

      setResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleShorten();
    }
  };

  const testShortUrl = async (shortLink) => {
    try {
      console.log(`Testing redirect for: ${shortLink}`);
      window.open(shortLink, '_blank');
    } catch (error) {
      console.error('Error testing short URL:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
         
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Let's make your long URL shorter!
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            Enter your long URL:
          </Typography>
          <TextField
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://github.com/rahul-9429/Portfolio"
            variant="outlined"
            disabled={loading}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Validity (minutes)
            </Typography>
            <TextField
              type="number"
              fullWidth
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              inputProps={{ min: 1 }}
              disabled={loading}
            />
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Custom shortcode (optional)
            </Typography>
            <TextField
              fullWidth
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="portfolio"
              disabled={loading}
            />
          </Box>
        </Box>

        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            onClick={handleShorten}
            disabled={loading || !url.trim()}
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem',
              borderRadius: 2
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Shortening your URL...
              </>
            ) : (
              'Shorten My URL!'
            )}
          </Button>
        </Box>
      </Paper>

      {copySuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Copied to clipboard! Share away!
        </Alert>
      )}

      {result && (
        <Paper elevation={3} sx={{ p: 4 }}>
          {result.success ? (
            <Box textAlign="center">
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                Success!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your URL has been shortened successfully!
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3, p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Original URL:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
                  {result.data.originalUrl}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Your shortened URL:
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'primary.50', 
                    borderRadius: 1, 
                    border: '2px solid',
                    borderColor: 'primary.main',
                    mb: 2
                  }}
                >
                  <Typography 
                    variant="h6" 
                    color="primary.main" 
                    sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                  >
                    {result.data.shortLink}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(result.data.shortLink)}
                    size="large"
                  >
                    Copy Link
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<LinkIcon />}
                    onClick={() => testShortUrl(result.data.shortLink)}
                    size="large"
                  >
                    Test Link
                  </Button>
                </Box>
                
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Expires: {new Date(result.data.expiry).toLocaleString()}
                  </Typography>
                </Box>
              </Card>
            </Box>
          ) : (
            <Box textAlign="center">
              <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" color="error.main" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Alert severity="error" sx={{ mt: 2 }}>
                {result.error}
              </Alert>
            </Box>
          )}
        </Paper>
      )}

      
    </Box>
  );
}

export default UrlShortenerPage;