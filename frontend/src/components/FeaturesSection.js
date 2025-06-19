// src/components/FeaturesSection.js
import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import HdIcon from '@mui/icons-material/Hd';

const features = [
  {
    title: 'HD Video and Audio',
    description: 'Enjoy crystal clear HD video and audio quality for smooth communication.',
    icon: <HdIcon sx={{ fontSize: 40, color: '#1976d2' }} />
  },
  {
    title: 'Cross-Device Support',
    description: 'Connect on any device, anytime. From laptops to smartphones, we’ve got you covered.',
    icon: <DevicesIcon sx={{ fontSize: 40, color: '#1976d2' }} />
  },
  {
    title: 'Secure Communication',
    description: 'Our platform ensures end-to-end encryption for the safety of your conversations.',
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#1976d2' }} />
  }
];

const FeaturesSection = () => {
  return (
    <Box sx={{ backgroundColor: '#f9f9f9', py: 8, borderTop: '4px solid #1976d2' }}>

      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}
      >
        Why Choose Us?
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{ color: '#555', maxWidth: 600, mx: 'auto', mb: 5 }}
      >
        TalkKAST brings you fast, secure, and effortless video communication — no matter where you are.
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ px: { xs: 2, md: 10 } }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                textAlign: 'center',
                borderRadius: 4,
                padding: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box mb={2}>{feature.icon}</Box>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                {feature.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturesSection;
