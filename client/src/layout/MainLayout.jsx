import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1a2e 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
          animation: 'pulse 15s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.5,
          },
          '50%': {
            transform: 'translate(-20%, 20%) scale(1.1)',
            opacity: 0.8,
          },
        },
      }}
    >
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 280px)` },
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
