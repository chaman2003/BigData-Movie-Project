import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';

const drawerWidth = 280;

const Navbar = ({ handleDrawerToggle }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        background: 'rgba(26, 32, 44, 0.8)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { md: 'none' },
            '&:hover': {
              background: 'rgba(0, 212, 255, 0.1)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome to MovieHub
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Discover your next favorite movie
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              color="inherit"
              sx={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.2)',
                },
              }}
            >
              <SearchIcon />
            </IconButton>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              color="inherit"
              sx={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.2)',
                },
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)',
                border: '2px solid rgba(0, 212, 255, 0.3)',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
              }}
            >
              U
            </Avatar>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
