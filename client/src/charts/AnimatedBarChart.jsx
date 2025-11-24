import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const colors = ['#00d4ff', '#6c63ff', '#ffaa00', '#00ff88', '#f472b6', '#a78bfa', '#34d399', '#f97316'];

const AnimatedBarChart = ({
  data = [],
  title,
  dataKey = 'count',
  xAxisKey = 'name',
  onItemClick,
  activeItem,
  emptyMessage = 'No data available for the current filters'
}) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(26, 32, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            p: 2,
            boxShadow: '0 8px 32px rgba(0, 212, 255, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {payload[0].payload[xAxisKey]}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#00d4ff',
              fontWeight: 600,
            }}
          >
            {payload[0].value} movies
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const isInteractive = typeof onItemClick === 'function';
  const normalizedActive = !activeItem || activeItem === 'All' ? null : activeItem;
  const total = data.reduce((sum, item) => sum + (item?.[dataKey] || 0), 0);
  const hasData = data.length > 0 && total > 0;

  const handleBarClick = (barData) => {
    if (!isInteractive || !barData?.payload) return;
    const payload = barData.payload;
    onItemClick(payload, payload[xAxisKey]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card
        sx={{
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
              <BarChart data={data}>
                <defs>
                  {colors.map((color, index) => (
                    <linearGradient key={index} id={`colorBar${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.5} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis
                  dataKey={xAxisKey}
                  stroke="rgba(255, 255, 255, 0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 212, 255, 0.1)' }} />
                <Bar
                  dataKey={dataKey}
                  radius={[8, 8, 0, 0]}
                  onClick={handleBarClick}
                  cursor={isInteractive ? 'pointer' : 'default'}
                >
                  {data.map((entry, index) => {
                    const label = entry?.[xAxisKey];
                    const isActive = !normalizedActive || normalizedActive === label;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#colorBar${index % colors.length})`}
                        opacity={isActive ? 1 : 0.3}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
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

export default AnimatedBarChart;
