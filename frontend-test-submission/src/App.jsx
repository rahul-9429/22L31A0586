import { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Chip,
  Link
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import UrlShortenerPage from './components/UrlShortenerPage';
import StatisticsPage from './components/StatisticsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000ff',
    },
    secondary: {
      main: '#030303ff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    }
  }
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ background: 'black' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              URL Shortener
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="rahul-9429" 
                variant="outlined" 
                size="small"
                sx={{ color: 'white', borderColor: 'white' }}
              />
              <Link 
                href="https://github.com/rahul-9429" 
                target="_blank" 
                rel="noopener"
                sx={{ color: 'white', display: 'flex', alignItems: 'center' }}
              >
                <GitHubIcon />
              </Link>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg">

          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="URL Shortener" />
              <Tab label="Statistics & Analytics" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <UrlShortenerPage />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <StatisticsPage />
          </TabPanel>
        </Container>
        
         
      </Box>
    </ThemeProvider>
  );
}

export default App;