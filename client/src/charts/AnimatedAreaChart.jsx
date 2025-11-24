import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedAreaChart = ({
  data = [],
  title,
  dataKey = 'value',
  xAxisKey = 'name',
  onPointClick,
  activeItem,
  emptyMessage = 'No timeline data available'
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(26, 32, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            p: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#00d4ff' }}>
            {payload[0].value} movies
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const isInteractive = typeof onPointClick === 'function';
  const normalizedActive = !activeItem || activeItem === 'All' ? null : activeItem;
  const hasData = data.length > 0;

  const handleClick = (state) => {
    if (!isInteractive || !state?.activeLabel) return;
    onPointClick(state.activePayload?.[0]?.payload ?? state.activePayload?.[0], state.activeLabel);
  };

  const renderDot = (props) => {
    const { cx, cy, payload } = props;
    const isActive = normalizedActive ? payload?.[xAxisKey]?.toString() === normalizedActive.toString() : false;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 6 : 4}
        stroke="#00d4ff"
        strokeWidth={isActive ? 3 : 2}
        fill={isActive ? '#00d4ff' : '#0f1419'}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          height: '100%',
          background: 'rgba(26, 32, 44, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          '&:hover': {
            boxShadow: '0 12px 48px 0 rgba(0, 212, 255, 0.2)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
          {hasData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} onClick={handleClick}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey={xAxisKey} 
                  stroke="rgba(255, 255, 255, 0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.5)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#00d4ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorArea)"
                  animationDuration={1000}
                  cursor={isInteractive ? 'pointer' : 'default'}
                  dot={renderDot}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">{emptyMessage}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedAreaChart;
