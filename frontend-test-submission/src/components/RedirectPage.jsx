import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  Divider,
  Button,
  Alert,
  Chip
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Schedule as ScheduleIcon,
  GitHub as GitHubIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function RedirectPage() {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [urlData, setUrlData] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

 

  useEffect(() => {
    fetchUrlData();
  }, [shortcode]);

  useEffect(() => {
    let timer;
    if (urlData && countdown > 0 && !redirecting) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && urlData && !redirecting) {
      handleRedirect();
    }
    return () => clearTimeout(timer);
  }, [countdown, urlData, redirecting]);

  const fetchUrlData = async () => {
    try {
      console.log(`[2025-09-04 07:17:37] Fetching data for shortcode: ${shortcode}`);
      
      const response = await axios.get(`${API_BASE}/shorturls/${shortcode}`, {
        timeout: 10000
      });

      console.log(`[2025-09-04 07:17:37] URL data fetched successfully:`, response.data);
      setUrlData(response.data);
      setLoading(false);
      
    } catch (error) {
      console.error(`[2025-09-04 07:17:37] Error fetching URL data:`, error);
      
      let errorMessage = 'Unable to fetch URL information';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Short URL not found';
        } else if (error.response.status === 410) {
          errorMessage = 'Short URL has expired';
        } else {
          errorMessage = error.response.data?.error || `Server Error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to server';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    if (urlData && !urlData.isExpired) {
      setRedirecting(true);
      console.log(`[2025-09-04 07:17:37] Redirecting to: ${urlData.originalUrl}`);
      
      setTimeout(() => {
        window.location.href = urlData.originalUrl;
      }, 500);
    }
  };

  const handleManualRedirect = () => {
    if (urlData && !urlData.isExpired) {
      handleRedirect();
    }
  };

  const handleCancel = () => {
    setCountdown(0);
    setRedirecting(false);
    console.log(`[2025-09-04 07:17:37] User cancelled redirect for ${shortcode}`);
  };

  const formatDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  };

  const isGitHubUrl = (url) => {
    return url && url.includes('github.com');
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Loading URL Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fetching details for shortcode: {shortcode}
          </Typography>
           
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <InfoIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" color="error.main" gutterBottom>
            Oops!
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Shortcode: {shortcode}
          </Typography>

          <Card variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Try these instead:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {githubRepos.map((repo, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  startIcon={<GitHubIcon />}
                  onClick={() => window.open(repo.url, '_blank')}
                  sx={{ fontSize: '0.8rem' }}
                >
                  {repo.name}
                </Button>
              ))}
            </Box>
          </Card>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
            
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" sx={{ mb: 4 }}>
          {redirecting ? (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Redirecting...
              </Typography>
            </>
          ) : (
            <>
              <LaunchIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Ready to Redirect
              </Typography>
            </>
          )}
          
          <Typography variant="body1" color="text.secondary">
            {redirecting ? 'Taking you to your destination...' : `Redirecting in ${countdown} seconds`}
          </Typography>
        </Box>

        <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Destination URL:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {isGitHubUrl(urlData.originalUrl) && (
              <GitHubIcon color="primary" sx={{ mr: 1 }} />
            )}
            <Typography 
              variant="h6" 
              sx={{ 
                wordBreak: 'break-all',
                color: 'primary.main',
                fontFamily: 'monospace'
              }}
            >
              {urlData.originalUrl}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={`Domain: ${formatDomain(urlData.originalUrl)}`} 
              size="small" 
              color="primary" 
            />
            <Chip 
              label={`Shortcode: ${urlData.shortcode}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`Clicks: ${urlData.totalClicks}`} 
              size="small" 
              color="success" 
            />
          </Box>

         
          
          {urlData.isExpired && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This URL has expired on {new Date(urlData.expiryDate).toLocaleString()}
            </Alert>
          )}
        </Card>

        {!urlData.isExpired && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<LaunchIcon />}
              onClick={handleManualRedirect}
              disabled={redirecting}
              size="large"
            >
              Go Now
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={redirecting}
            >
              Cancel ({countdown})
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

         
      </Paper>
    </Box>
  );
}

export default RedirectPage;