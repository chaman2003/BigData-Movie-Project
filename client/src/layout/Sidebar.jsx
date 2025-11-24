import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MovieIcon from '@mui/icons-material/Movie';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Movies', icon: <MovieIcon />, path: '/movies' },
  { text: 'Recommendations', icon: <ThumbUpIcon />, path: '/recommendations' },
];

const MotionListItem = motion(ListItem);

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, rgba(26, 32, 44, 0.95) 0%, rgba(15, 20, 25, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0, 212, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 212, 255, 0.4)',
            }}
          >
            <MovieIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
        </motion.div>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00d4ff 0%, #00e4ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MovieHub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Premium Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <MotionListItem
              key={item.text}
              button
              onClick={() => {
                navigate(item.path);
                if (isMobile) handleDrawerToggle();
              }}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                mb: 1,
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 128, 255, 0.15) 100%)'
                  : 'transparent',
                border: isActive ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  transform: 'translateX(8px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: 'linear-gradient(180deg, #00d4ff 0%, #0080ff 100%)',
                    borderRadius: '0 4px 4px 0',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <ListItemIcon
                sx={{
                  color: isActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.6)',
                  minWidth: 40,
                  transition: 'all 0.3s ease',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.8)',
                }}
              />
            </MotionListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          © 2025 MovieHub
        </Typography>

      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
