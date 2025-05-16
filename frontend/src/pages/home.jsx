import React, { useContext, useEffect, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css"
import { Button, Grid, IconButton, TextField, Typography, Paper, Tooltip, Fade } from '@mui/material'
import RestoreIcon from '@mui/icons-material/Restore'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { AuthContext } from '../contexts/AuthContext'
import { styled } from '@mui/system'

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

    const FadeInPaper = styled(Paper)(({ theme }) => ({
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        transition: "all 0.4s ease",
        backgroundColor: "#fff"
    }))

    return (
        <>
            <div className="navBar" style={{
                backgroundColor: "#282c34",
                padding: "10px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#ffffff"
            }}>
                <h2 style={{ color: "#ffffff", margin: 0 }}>Apna Video Call</h2>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <IconButton onClick={() => navigate("/history")} style={{ color: "#ffffff" }}>
                        <RestoreIcon />
                    </IconButton>
                    <p style={{ margin: 0, color: "#ffffff" }}>History</p>

                    <Button
                        variant="outlined"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                        style={{ color: "#ffffff", borderColor: "#ffffff" }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div style={{
                minHeight: "calc(100vh - 60px)",
                padding: "40px",
                backgroundColor: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <Grid
            container
            spacing={4}
            alignItems="flex-start"
            justifyContent="center"
            direction="row" // ensures horizontal layout
            >
            {/* Join a Meeting */}
            <Grid item xs={12} md={4}>
                <Fade in timeout={500}>
                <FadeInPaper elevation={3}>
                    <Typography variant="h5" gutterBottom>
                    Join a Meeting
                    </Typography>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                    Enter a meeting code to join an existing video call
                    </Typography>
                    <Grid container spacing={2} alignItems="center" sx={{ marginTop: "10px" }}>
                    <Grid item xs={8}>
                        <TextField
                        fullWidth
                        label="Meeting Code"
                        variant="outlined"
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleJoinVideoCall}
                        sx={{ height: "100%" }}
                        >
                        Join
                        </Button>
                    </Grid>
                    </Grid>
                </FadeInPaper>
                </Fade>
            </Grid>

            {/* Center Logo */}
            <Grid item xs={12} md={3} style={{ textAlign: "center" }}>
                <img
                src="/logo3.png"
                alt="App Logo"
                style={{
                    maxWidth: "200px",
                    height: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    marginTop: "20px",
                }}
                />
            </Grid>

            {/* Start a Meeting */}
            <Grid item xs={12} md={4}>
                <Fade in timeout={800}>
                <FadeInPaper elevation={3}>
                    <Typography variant="h5" gutterBottom>
                    Or Start Your Own Meeting
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                    Share the generated code below to invite others
                    </Typography>
                    <Grid container spacing={2} alignItems="center" sx={{ marginTop: "10px" }}>
                    <Grid item xs={8}>
                        <TextField
                        fullWidth
                        value={generatedCode}
                        InputProps={{
                            readOnly: true,
                        }}
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