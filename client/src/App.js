import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="movies" element={<Movies />} />
            <Route path="recommendations" element={<Recommendations />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
