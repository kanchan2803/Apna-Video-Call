// src/components/Footer.js
import React from 'react';
import { Box, Typography, Grid, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: '#1976d2', color: 'white', padding: '20px 0' }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item>
          <Typography variant="h6">Apna Video Call</Typography>
        </Grid>
        <Grid item>
          <Link href="/about" color="inherit">About Us</Link>
        </Grid>
        <Grid item>
          <Link href="/contact" color="inherit">Contact</Link>
        </Grid>
        <Grid item>
          <Typography variant="body2">© 2025 Apna Video Call</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
