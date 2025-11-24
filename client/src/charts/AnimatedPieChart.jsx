import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const COLORS = ['#00d4ff', '#6c63ff', '#ffaa00', '#00ff88', '#f472b6', '#a78bfa', '#34d399', '#f97316'];

const AnimatedPieChart = ({
  data = [],
  title,
  dataKey = 'value',
  nameKey = 'name',
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
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#00d4ff' }}>
            {payload[0].value} movies ({((payload[0].value / data.reduce((sum, item) => sum + item[dataKey], 0)) * 100).toFixed(1)}%)
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

  const renderLegend = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center',
        mt: 2,
      }}
    >
      {data.map((entry, index) => {
        const label = entry?.[nameKey] || 'Unknown';
        const isActive = !normalizedActive || normalizedActive === label;
        return (
          <Box
            key={`${label}-${index}`}
            onClick={() => isInteractive && onItemClick(entry, label)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: isInteractive ? 'pointer' : 'default',
              opacity: isActive ? 1 : 0.35,
              px: 0.5,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: COLORS[index % COLORS.length],
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

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
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey={dataKey}
                  nameKey={nameKey}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => {
                    const label = entry?.[nameKey];
                    const isActive = !normalizedActive || normalizedActive === label;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        opacity={isActive ? 1 : 0.35}
                        onClick={() => isInteractive && onItemClick(entry, label)}
                        cursor={isInteractive ? 'pointer' : 'default'}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
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

export default AnimatedPieChart;
