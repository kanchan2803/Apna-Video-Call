// src/components/Footer.js
import React from 'react';
import { Box, Typography, Grid, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: '#1976d2', color: 'white', padding: '20px 0' }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item>
          <Typography variant="h6">TalkKAST</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2">© 2025 TalkKAST</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
