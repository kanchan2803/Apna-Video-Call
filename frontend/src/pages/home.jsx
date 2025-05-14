import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        if(meetingCode.trim()){
            await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`);
        }
    }

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

                <div style={{ display: "flex", alignItems: "center" , gap: "15px"}}>
                    <IconButton onClick={
                        () => {
                            navigate("/history")
                        }}
                        style = {{ color: "#ffffff" }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    <p style={{ margin: 0, color: "#ffffff" }}>History</p>

                    <Button 
                        variant = "outlined"
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


            <div className="meetContainer" 
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "50px",
                height: "calc(100vh - 60px)",
                backgroundColor: "#f4f6f8"
            }}>
                <div className="leftPanel" style={{ flex: 1 }}>
                    <div>
                        <h2 style={{
                        color: "#333",
                        marginBottom: "20px",
                        fontSize: "28px",
                        fontWeight: 600
                        }}>
                            Providing Quality Video Call Just Like Quality Education
                        </h2>

                        <div style={{ display: 'flex', gap: "15px" ,flexWrap: "wrap" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined"
                            sx = {{ width: "250px" }}
                            />
                            <Button onClick={handleJoinVideoCall} variant='contained'
                            color='primary'
                            sx = {{ height: '56px'}}
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel' style={{ flex: 1, textAlign: "center" }}>
                    <img src='/logo3.png' alt="App Logo" 
                    style={{
                            maxWidth: "80%",
                            height: "auto",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
                        }}
                    />
                </div>
            </div>
        </>
    );
}


export default withAuth(HomeComponent)