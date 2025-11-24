import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedRadarChart = ({
  data = [],
  title,
  dataKey = 'value',
  nameKey = 'name',
  onItemClick,
  activeItem,
  emptyMessage = 'No genre insights available'
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
            {payload[0].payload[nameKey]}
          </Typography>
          <Typography variant="body2" sx={{ color: '#00d4ff' }}>
            {payload[0].value} movies
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const isInteractive = typeof onItemClick === 'function';
  const normalizedActive = !activeItem || activeItem === 'All' ? null : activeItem;
  const hasData = data.length > 0;

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
        const label = entry?.[nameKey] || `Item ${index + 1}`;
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
                background: '#00d4ff',
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

  const renderAngleTick = (props) => {
    const { payload, x, y, textAnchor } = props;
    const label = payload?.value;
    const isActive = !normalizedActive || normalizedActive === label;
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
        fontSize={11}
        onClick={() => isInteractive && onItemClick(payload?.payload, label)}
        style={{ cursor: isInteractive ? 'pointer' : 'default' }}
      >
        {label}
      </text>
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
              <RadarChart data={data}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                <PolarAngleAxis 
                  dataKey={nameKey}
                  tick={renderAngleTick}
                />
                <PolarRadiusAxis 
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px' }}
                />
                <Radar
                  name="Movies"
                  dataKey={dataKey}
                  stroke="#00d4ff"
                  fill="#00d4ff"
                  fillOpacity={0.5}
                  strokeWidth={2}
                  animationDuration={1000}
                  cursor={isInteractive ? 'pointer' : 'default'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </RadarChart>
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

export default AnimatedRadarChart;
