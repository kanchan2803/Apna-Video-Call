import React from 'react';
import Footer from '../components/Footer';
import FeaturesSection from '../components/FeaturesSection';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid
} from '@mui/material';
import '../App.css';
import { TypeAnimation } from 'react-type-animation';

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className='landingPageContainer'>
      {/* AppBar for Top Navigation */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">TalkKAST</Typography>
          <Box>
            <Button color="inherit" onClick={() => router('/aljk23')}>
              Join as Guest
            </Button>
            <Button color="inherit" onClick={() => router('/auth')}>
              Register
            </Button>
            <Button color="inherit" onClick={() => router('/auth')}>
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Landing Content */}
      <Container maxWidth="lg" sx={{ marginTop: 8 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Text Section with Glassmorphism */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: 'white',
                maxWidth: '100%',
              }}
            >
              {/* Static "Connect" Text in Black */}
              <Typography variant="h3" sx={{ color: 'black' }}>
                Connect
              </Typography>

              {/* TypeAnimation for the following lines */}
              <TypeAnimation
                sequence={[
                  'With Family and Friends',
                  2000, // Wait for 2s
                  '',
                  500,  // Wait before retyping

                  'Across Any Device',
                  2000,
                  '',
                  500,

                  'In HD Video and Audio',
                  2000,
                  '',
                  500,

                  'Instantly, Anywhere',
                  2000,
                  '',
                  500,

                  'With One Click',
                  2000,
                  '',
                  500,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'blue' }}
              />

              <Typography variant="h6" paragraph sx={{ marginTop: 2, color: 'blue' }} >
                Cover the distance with TalkKAST — simple, secure and smooth video calls for everyone.
              </Typography>

              <Button
                variant="contained"
                size="large"
                sx={{ marginTop: 3, backgroundColor: '#FF9839' }}
                component={Link}
                to="/auth"
              >
                Get Started
              </Button>
            </Box>
          </Grid>

            <Grid item xs={12} md={6}>
                <Box
                    component="video"
                    src="/22.mp4"
                    // controls
                    autoPlay
                    loop
                    muted
                    sx={{
                        width: '100%',
                        maxWidth: '400px',
                        height: '400px', // ← Set desired height here
                        // objectFit: 'cover' // Optional: ensures the video fills the box neatly
                        }}
                />
            </Grid>

          
        </Grid>
      </Container>
      <FeaturesSection />
      <Footer />
    </div>
  );
}
