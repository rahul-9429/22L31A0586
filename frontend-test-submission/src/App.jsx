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
  Link,
  Avatar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
  const [anchorEl, setAnchorEl] = useState(null);

  // Current context data
  const currentUser = 'rahul-9429';
  const currentDateTime = '2025-09-04 07:20:08';
  const topRepositories = [
    { name: 'rahul-9429/mock-test', url: 'https://github.com/rahul-9429/mock-test' },
    { name: 'rahul-9429/Portfolio', url: 'https://github.com/rahul-9429/Portfolio' },
    { name: 'rahul-9429/mamu-cv', url: 'https://github.com/rahul-9429/mamu-cv' },
    { name: 'rahul-9429/22L31A0586', url: 'https://github.com/rahul-9429/22L31A0586' },
    { name: 'Daspavan020/Icon-Travels', url: 'https://github.com/Daspavan020/Icon-Travels' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    console.log(`[${currentDateTime}] ${currentUser} switched to tab: ${newValue === 0 ? 'URL Shortener' : 'Statistics & Analytics'}`);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRepoClick = (repo) => {
    console.log(`[${currentDateTime}] ${currentUser} accessing repository: ${repo.name}`);
    window.open(repo.url, '_blank');
    handleMenuClose();
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
            <UrlShortenerPage 
              currentUser={currentUser}
              currentDateTime={currentDateTime}
              topRepositories={topRepositories}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <StatisticsPage 
              currentUser={currentUser}
              currentDateTime={currentDateTime}
              topRepositories={topRepositories}
            />
          </TabPanel>
        </Container>
        
        <Box 
          component="footer" 
          sx={{ 
            mt: 4, 
            py: 2, 
            px: 3, 
            bgcolor: 'grey.100',
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;