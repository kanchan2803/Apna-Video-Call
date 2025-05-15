import React, { useEffect, useRef, useState } from 'react';
import { TextField, Button } from '@mui/material';

function LobbyComponent({ connect , username,setUsername}) {
    
    const localVideoref = useRef(null);

    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Webcam access denied:", err);
            }
        };

        getUserMedia();

        return () => {
            if (localVideoref.current && localVideoref.current.srcObject) {
                localVideoref.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(to right, #141e30, #243b55)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '20px'
        }}>
            {/* Optional floating background elements */}
                        <div style={{
                             position: 'absolute',
                             width: '200px',
                             height: '200px',
                             backgroundColor: '#d0e7ff',
                             borderRadius: '50%',
                             top: '-50px',
                             left: '-50px',
                             opacity: 0.3,
                             zIndex: 0
                         }}></div>
                         <div style={{
                             position: 'absolute',
                             width: '300px',
                             height: '300px',
                             backgroundColor: '#ffffff',
                             borderRadius: '50%',
                             bottom: '-100px',
                             right: '-100px',
                             opacity: 0.15,
                             zIndex: 0
                         }}></div>
            <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '40px', 
                borderRadius: '16px', 
                maxWidth: '420px', 
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e0e0e0'
            }}>
                <h2 style={{ 
                    color: '#1976d2', 
                    marginBottom: '25px', 
                    fontWeight: 600,
                    fontSize: '26px'
                }}>
                    Enter the Lobby
                </h2>

                <TextField 
                    id="username" 
                    label="Enter Your Username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    variant="outlined" 
                    fullWidth 
                    sx={{ marginBottom: '24px' }} 
                />
                
                <Button 
                    variant="contained" 
                    onClick={() => connect(username)} 
                    fullWidth 
                    disabled={!username.trim()}
                    sx={{
                        padding: '12px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#115293'
                        }
                    }}
                >
                    Connect
                </Button>

                <video 
                    ref={localVideoref} 
                    autoPlay 
                    muted 
                    playsInline 
                    style={{ 
                        marginTop: '30px',
                        width: '100%', 
                        maxHeight: '250px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                    }} 
                />
            </div>
        </div>
    );
}

export default LobbyComponent;
