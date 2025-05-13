// src/components/HeroSection.js
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(45deg, #FF9839, #1976d2)',
        color: 'white',
        padding: '50px 20px',
        textAlign: 'left',
        height: '100vh',
      }}
    >
      <Typography variant="h3" gutterBottom>
        <TypeAnimation
          sequence={[
            'Connect with your loved ones',
            2000,
            'Connect across any device',
            2000,
            'Connect instantly, anywhere',
            2000,
          ]}
          wrapper="h2"
          speed={50}
          repeat={Infinity}
        />
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: 4 }}>
        Simple, secure, and smooth video calls for everyone. Start your journey today!
      </Typography>
      <Button
        variant="contained"
        size="large"
        component={Link}
        to="/auth"
        sx={{ backgroundColor: '#FF9839' }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default HeroSection;
