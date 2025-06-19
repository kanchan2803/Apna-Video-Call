import React, { useContext, useEffect, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css"
import {
  Button, Grid, IconButton, TextField, Typography, Paper,
  Tooltip, Fade
} from '@mui/material'
import RestoreIcon from '@mui/icons-material/Restore'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { AuthContext } from '../contexts/AuthContext'
import { styled } from '@mui/system'

const FadeInPaper = styled(Paper)(({ theme }) => ({
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  transition: "all 0.4s ease",
  backgroundColor: "#fff"
}))

function HomeComponent() {
  const navigate = useNavigate()
  const [meetingCode, setMeetingCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const { addToUserHistory } = useContext(AuthContext)

  useEffect(() => {
    generateRandomCode()
  }, [])

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 10)
    setGeneratedCode(code)
  }

  const handleJoinVideoCall = async () => {
    if (meetingCode.trim()) {
      await addToUserHistory(meetingCode)
      navigate(`/${meetingCode}`)
    }
  }

  const handleStartNewMeet = async () => {
    await addToUserHistory(generatedCode)
    navigate(`/${generatedCode}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  return (
    <>
      {/* Top Nav */}
      <div className="navBar" style={{
        backgroundColor: "#282c34",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#ffffff"
      }}>
        <h2 style={{ color: "#ffffff", margin: 0 }}>TalkKAST</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <IconButton onClick={() => navigate("/history")} style={{ color: "#ffffff" }}>
            <RestoreIcon />
          </IconButton>
          <p style={{ margin: 0, color: "#ffffff" }}>History</p>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem("token")
              navigate("/")
            }}
            style={{ color: "#ffffff", borderColor: "#ffffff" }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
            minHeight: "calc(100vh - 60px)",
            padding: "40px",
            background: "linear-gradient(270deg, #e0eafc, #cfdef3, #fbc2eb, #a6c1ee)",
            backgroundSize: "800% 800%",
            animation: "gradientBG 15s ease infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
            }}
      >
        <Grid container spacing={6} alignItems="flex-start" justifyContent="center">

          {/* Join Meeting */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={500}>
              <FadeInPaper elevation={3}>
                <Typography variant="h5" gutterBottom>Join a Meeting</Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Enter a meeting code to join an existing video call
                </Typography>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleJoinVideoCall()
                }}>
                  <Grid container spacing={2} alignItems="center" sx={{ marginTop: "10px" }}>
                      <TextField
                        fullWidth
                        label="Meeting Code"
                        variant="outlined"
                        value={meetingCode}
                        xs={8}
                        onChange={(e) => setMeetingCode(e.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ height: "100%", marginTop: "20px"}}
                        xs={4}
                      >
                        Join
                      </Button>
                  </Grid>
                </form>
              </FadeInPaper>
            </Fade>
          </Grid>

          {/* Center Logo */}
          <Grid item xs={12} md={3} style={{ textAlign: "center" }}>
  <Paper
    elevation={3}
    sx={{
      padding: "20px",
      borderRadius: "16px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      minHeight: "200px",
    }}
  >
    <img
      src="/logo3.png"
      alt="App Logo"
      style={{
        maxWidth: "220px",
        height: "auto",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    />

    <Typography
      variant="h6"
      color="textSecondary"
      sx={{ marginTop: "15px", fontWeight: "bold", letterSpacing: "1px" }}
    >
      OR
    </Typography>
  </Paper>
</Grid>

          {/* Start Meeting */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={800}>
              <FadeInPaper elevation={3}>
                <Typography variant="h5" gutterBottom>Start Your Own Meeting</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Share the generated code below to invite others
                </Typography>
                <Grid container spacing={2} alignItems="center" sx={{ marginTop: "10px" }}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      value={generatedCode}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Tooltip title="Copy Code">
                      <IconButton onClick={handleCopy}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={2}>
                    <Tooltip title="Generate New Code">
                      <IconButton onClick={generateRandomCode}>
                        <AutorenewIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ marginTop: "20px" }}
                  onClick={handleStartNewMeet}
                >
                  Start Meeting
                </Button>
              </FadeInPaper>
            </Fade>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default withAuth(HomeComponent)
