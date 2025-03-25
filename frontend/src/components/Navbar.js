import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as FinanceIcon,
  Forum as ForumIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  AccountCircle,
  Notifications,
  Settings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Expenses', icon: <FinanceIcon />, path: '/expenses' },
    { text: 'Forum', icon: <ForumIcon />, path: '/forum' },
  ];

  const drawer = (
    <Box sx={{ bgcolor: 'rgba(18,18,18,0.95)', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          FinSage
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (!isDesktop) setMobileOpen(false);
            }}
            sx={{
              bgcolor: isActive(item.path) ? 'rgba(255,107,0,0.1)' : 'transparent',
              color: isActive(item.path) ? '#FF6B00' : 'text.primary',
              borderLeft: isActive(item.path) ? '4px solid #FF6B00' : '4px solid transparent',
              '&:hover': {
                bgcolor: 'rgba(255,107,0,0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? '#FF6B00' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Only show navbar when user is authenticated
  if (!currentUser) {
    return null;
  }

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'rgba(18,18,18,0.9)', 
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              display: { xs: isDesktop ? 'block' : 'none', md: 'block' },
              background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FinSage
          </Typography>

          {isDesktop && (
            <Box sx={{ display: 'flex', mx: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 1,
                    color: isActive(item.path) ? '#FF6B00' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'rgba(255,107,0,0.05)',
                    },
                    position: 'relative',
                    '&::after': isActive(item.path) ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '20%',
                      width: '60%',
                      height: '2px',
                      bgcolor: '#FF6B00'
                    } : {}
                  }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex' }}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {currentUser?.image_url ? (
                <Avatar 
                  src={currentUser.image_url} 
                  alt={`${currentUser.first_name} ${currentUser.last_name}`}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: '#1E1E1E',
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">{currentUser?.first_name} {currentUser?.last_name}</Typography>
          <Typography variant="body2" color="text.secondary">{currentUser?.email}</Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            bgcolor: '#1A1A1A',
            borderRight: '1px solid rgba(255,255,255,0.05)'
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Add toolbar spacing to prevent content from hiding under app bar */}
      <Toolbar />
    </>
  );
}

export default Navbar;