// src/components/FeaturesSection.js
import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const FeaturesSection = () => {
  return (
    <Grid container spacing={4} sx={{ padding: '50px 20px' }}>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              HD Video and Audio
            </Typography>
            <Typography variant="body1">
              Enjoy crystal clear HD video and audio quality for smooth communication.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Cross-Device Support
            </Typography>
            <Typography variant="body1">
              Connect on any device, anytime. From laptops to smartphones, we’ve got you covered.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Secure Communication
            </Typography>
            <Typography variant="body1">
              Our platform ensures end-to-end encryption for the safety of your conversations.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default FeaturesSection;
