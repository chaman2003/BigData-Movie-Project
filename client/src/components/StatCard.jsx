import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const StatCard = ({ title, value, icon, subtitle, color = '#00d4ff', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -8 }}
    >
      <Card
        sx={{
          height: '100%',
          background: 'rgba(26, 32, 44, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          },
          '&:hover': {
            boxShadow: `0 12px 48px 0 ${color}33`,
            border: `1px solid ${color}44`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${color} 0%, ${color}88 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {typeof value === 'number' ? (
                  <CountUp end={value} duration={2} decimals={value % 1 !== 0 ? 1 : 0} />
                ) : (
                  value
                )}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: `${color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
