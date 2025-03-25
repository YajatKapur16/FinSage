import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrollToSection } from '../utils/scrollToSection';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigation = (path) => {
    if (path.startsWith('/#')) {
      scrollToSection(path.substring(2));
    } else {
      navigate(path);
    }
    setMobileOpen(false);
  };

  const navItems = [
    { label: 'Features', path: '/#features' },
    { label: 'Chatbot', path: '/#chatbot' },
    { label: 'Testimonials', path: '/#testimonials' },
    { label: 'Contact', path: '/#contact' }
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        bgcolor: 'rgba(18,18,18,0.8)', 
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,107,0,0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            onClick={() => handleNavigation('/')} 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            FinSage
          </Typography>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    mx: 1,
                    color: 'text.primary',
                    '&:hover': {
                      color: '#FF6B00'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                onClick={() => navigate('/auth')}
                sx={{
                  bgcolor: '#FF6B00',
                  '&:hover': {
                    bgcolor: '#FF8C00',
                  },
                  ml: 2,
                  px: 3
                }}
              >
                Login / Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            bgcolor: '#121212',
            borderLeft: '1px solid rgba(255,255,255,0.05)'
          },
        }}
      >
        <Box sx={{ pt: 2 }}>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.label} 
              onClick={() => handleNavigation(item.path)}
              sx={{ 
                py: 1.5,
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'rgba(255,107,0,0.1)',
                  color: '#FF6B00'
                }
              }}
            >
              {item.label}
            </ListItem>
          ))}
          <ListItem 
            button 
            onClick={() => {
              navigate('/auth');
              setMobileOpen(false);
            }}
            sx={{ 
              py: 1.5,
              color: '#FF6B00',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255,107,0,0.1)'
              }
            }}
          >
            Login / Sign Up
          </ListItem>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default PublicNavbar;