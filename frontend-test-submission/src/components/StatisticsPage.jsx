import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  IconButton,
  Collapse,
  Link,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Analytics as AnalyticsIcon,
  GitHub as GitHubIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function StatisticsPage() {
  const [shortcode, setShortcode] = useState('');
  const [stats, setStats] = useState(null);
  const [allUrls, setAllUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchAllUrls();
  }, []);

  const fetchAllUrls = async () => {
    setLoadingAll(true);
    try {
      const response = await axios.get(`${API_BASE}/urls`);
      setAllUrls(response.data.urls || response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoadingAll(false);
    }
  };

  const fetchStats = async () => {
    if (!shortcode.trim()) {
      setError('Please enter a shortcode to search! 🔍');
      return;
    }

    setLoading(true);
    setError('');
    setStats(null);

    try {
      const response = await axios.get(`${API_BASE}/shorturls/${shortcode.trim()}`);
      setStats(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Couldn't find that shortcode. Double-check and try again! 🤔");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (shortcode) => {
    setExpandedCards(prev => ({
      ...prev,
      [shortcode]: !prev[shortcode]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (isExpired) => {
    return isExpired ? 'error' : 'success';
  };

  const getStatusText = (isExpired) => {
    return isExpired ? ' Expired' : ' Active';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      fetchStats();
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
    
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Search for a Specific URL
        </Typography>
         
        
        <Box display="flex" gap={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <TextField
            label="Enter shortcode (e.g., abc123)"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="abc123"
            sx={{ flexGrow: 1 }}
            disabled={loading}
          />
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            onClick={fetchStats}
            disabled={loading || !shortcode.trim()}
            size="large"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {stats && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom textAlign="center">
                Analytics for: {stats.shortcode}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Overview
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                          Original URL:
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
                        {stats.originalUrl}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                          Short Link:
                      </Typography>
                      <Typography variant="body1" color="primary.main" sx={{ fontFamily: 'monospace' }}>
                        {stats.shortLink}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                          Created:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(stats.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                         Expires:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(stats.expiryDate)}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%', textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Stats
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Chip
                        label={getStatusText(stats.isExpired)}
                        color={getStatusColor(stats.isExpired)}
                        size="large"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {stats.totalClicks}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                         Total Clicks
                      </Typography>
                    </Box>
                    
                    
                  </Card>
                </Grid>
              </Grid>

              {stats.analytics && stats.analytics.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                     Click History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell> When</TableCell>
                          <TableCell> From Where</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.analytics.slice(0, 10).map((click, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(click.timestamp)}</TableCell>
                            <TableCell>{click.referrer}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {stats.analytics.length > 10 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Showing latest 10 clicks out of {stats.analytics.length} total
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
            All Your Shortened URLs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {allUrls.length} URLs created  
            </Typography>
          </Box>
          <Button 
            onClick={fetchAllUrls} 
            variant="outlined"
            startIcon={loadingAll ? <CircularProgress size={16} /> : <RefreshIcon />}
            disabled={loadingAll}
          >
            {loadingAll ? 'Loading...' : 'Refresh'}
          </Button>
        </Box>

        {allUrls.length === 0 ? (
          <Alert severity="warning" sx={{ textAlign: 'center' }}>
            
            <Typography  >
              No URLs created yet. Go to the URL Shortener tab to create your first shortened URL.
            </Typography>
            
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {allUrls.map((url) => (
              <Grid item xs={12} sm={6} md={4} key={url.shortcode}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" sx={{ flexGrow: 1, mr: 1, fontFamily: 'monospace' }}>
                         /{url.shortcode}
                      </Typography>
                      <Chip
                        label={getStatusText(url.isExpired)}
                        color={getStatusColor(url.isExpired)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom 
                      sx={{ 
                        wordBreak: 'break-all',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {url.originalUrl}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                         {url.clickCount} clicks
                      </Typography>
                      <IconButton
                        onClick={() => toggleExpanded(url.shortcode)}
                        size="small"
                      >
                        {expandedCards[url.shortcode] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    
                    <Collapse in={expandedCards[url.shortcode]}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                         Created: {formatDate(url.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Expires: {formatDate(url.expiryDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                         {url.shortLink}
                      </Typography>
                     
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

     
    </Box>
  );
}

export default StatisticsPage;