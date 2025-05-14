import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, colors, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import LobbyComponent from '../components/LobbyComponent';
import ChatBox from '../components/ChatBox';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent(){

    var socketRef = useRef();
    const [users, setUsers] = useState({});
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    let [participantCount, setParticipantCount] = useState(1); // including yourself


    // TODO
    // if(isChrome() === false) 
    // }
    useEffect(() => {
        console.log("HELLO")
        getPermissions();
    },[])
    // Handle screen sharing state changes
  useEffect(() => {
    if (screen !== undefined && !askForUsername) {
      getDisplayMedia()
    }
  }, [screen, askForUsername])

    // let getDislayMedia = () => {
    //     if (screen) {
    //         if (navigator.mediaDevices.getDisplayMedia) {
    //             navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    //                 .then(getDislayMediaSuccess)
    //                 .then((stream) => { })
    //                 .catch((e) => console.log(e))
    //         }
    //     }
    // }

    


    // Handle video/audio state changes
  useEffect(() => {
    if (video !== undefined && audio !== undefined && !askForUsername) {
      getUserMedia()
    }
  }, [video, audio, askForUsername])

// **
    

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

let getDisplayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    const getDisplayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => console.log("getDisplayMedia error:", e))
    }
  } 

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }


    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href, {
                path: window.location.pathname,
                username: username
            })
            socketIdRef.current = socketRef.current.id

            socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
                console.log("Received chat message:", data, sender);
                addMessage(data, sender, socketIdSender);
            });
            

            // socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setParticipantCount(prev => Math.max(1,prev - 1));

                // remove user from users state
                setUsers((prev) => {
                    const newUsers = { ...prev };
                    delete newUsers[id];
                    return newUsers;
                });
                console.log("User left:", id);

            })

            
            // socketRef.current.on("user-joined", ({ id, username }, allUsers) => {
            //     console.log("User joined:", username);
            
            //     // Save the username
            //     setUsers(prev => ({
            //         ...prev,
            //         [id]: { username }
            //     }));
            
            //     // Set up peer connection etc...
            // });

            socketRef.current.on('user-joined', ({id, username: remoteUsername }, clients) => {
                console.log("User joined:", remoteUsername);
                // Save the username
                setUsers(prev => ({
                    ...prev,
                    [id]: { username: remoteUsername || "Guest" },
                }));

                // Set up peer connection etc...
                clients.forEach((socketListId) => {
                    if(!connections[socketListId]) {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                // setParticipantCount(prev => prev + 1);
                                return updatedVideos;   

                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                setParticipantCount(prev => prev + 1);
                                return updatedVideos;
                                
                            });
                        }
                    };

            //         connectionsRef.current[socketListId].onaddstream = (event) => {
            //   // Check if video already exists
            //   const videoExists = videos.some((video) => video.socketId === socketListId)

            //   if (!videoExists) {
            //     // Create a new video
            //     const newVideo = {
            //       socketId: socketListId,
            //       stream: event.stream,
            //       username: users[socketListId]?.username || "Guest",
            //     }

            //     setVideos((prevVideos) => [...prevVideos, newVideo])
            //     setParticipantCount((prev) => prev + 1)
            //   }
            // }


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                }
            })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !video
      })
    }
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !audio
      })
    }
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    // let handleMessage = (e) => {
    //     setMessage(e.target.value);
    // }

    // const addMessage = (data, sender, socketIdSender) => {
    //     setMessages((prevMessages) => [
    //         ...prevMessages,
    //         { sender: sender, data: data }
    //     ]);
    //     if (socketIdSender !== socketIdRef.current) {
    //         setNewMessages((prevNewMessages) => prevNewMessages + 1);
    //     }
    // };



    // let sendMessage = () => {
    //     console.log(socketRef.current);
    //     socketRef.current.emit('chat-message', message, username)
    //     setMessage("");

    //     // this.setState({ message: "", sender: username })
    // }
    const addMessage = (data, sender, socketIdSender) => {
    console.log("Adding message:", data, sender, socketIdSender)
    setMessages((prevMessages) => [...prevMessages, { sender: sender || "Unknown", data: data }])

    if (socketIdSender !== socketIdRef.current && !showModal) {
      setNewMessages((prev) => prev + 1)
    }
  }

    const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return

    console.log("Sending message:", message, username)
    socketRef.current.emit("chat-message", message, username)

    // Add own message to chat
    addMessage(message, username, socketIdRef.current)

    setMessage("")
  }
    
    const connect = async (username) => {
        if (!username.trim()) {
      alert("Please enter a username")
      return
    }
        setAskForUsername(false);
        setUsername(username);

        await getPermissions();
        getMedia();
    };


    return (
        <div>

            {askForUsername ?(

                // <div>

                //     {/* Entering the lobby and entering name before joining */}

                //     {/* <h2 style={{ color: 'blue' }}>Enter into Lobby</h2>
                //     <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                //     <Button variant="contained" onClick={connect}>Connect</Button> */}
                //     <div style={{ 
                //         minHeight: '100vh', 
                //         background: 'linear-gradient(to right, #141e30, #243b55)', 
                //         display: 'flex', 
                //         justifyContent: 'center', 
                //         alignItems: 'center',
                //         position: 'relative',
                //         overflow: 'hidden',
                //         padding: '20px'
                //     }}>
                //         {/* Optional floating background elements */}
                //         <div style={{
                //             position: 'absolute',
                //             width: '200px',
                //             height: '200px',
                //             backgroundColor: '#d0e7ff',
                //             borderRadius: '50%',
                //             top: '-50px',
                //             left: '-50px',
                //             opacity: 0.3,
                //             zIndex: 0
                //         }}></div>
                //         <div style={{
                //             position: 'absolute',
                //             width: '300px',
                //             height: '300px',
                //             backgroundColor: '#ffffff',
                //             borderRadius: '50%',
                //             bottom: '-100px',
                //             right: '-100px',
                //             opacity: 0.15,
                //             zIndex: 0
                //         }}></div>

                //         {/* Main lobby card */}
                //         <div style={{ 
                //             backgroundColor: '#ffffff', 
                //             padding: '40px', 
                //             borderRadius: '16px', 
                //             maxWidth: '420px', 
                //             width: '100%',
                //             textAlign: 'center',
                //             boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                //             border: '1px solid #e0e0e0',
                //             zIndex: 1
                //         }}>
                //             <h2 style={{ 
                //                 color: '#1976d2', 
                //                 marginBottom: '25px', 
                //                 fontWeight: 600,
                //                 fontSize: '26px'
                //             }}>
                //                 Enter the Lobby
                //             </h2>
                            
                //             <TextField 
                //                 id="username" 
                //                 label="Enter Your Username" 
                //                 value={username} 
                //                 onChange={e => setUsername(e.target.value)} 
                //                 variant="outlined" 
                //                 fullWidth 
                //                 sx={{ marginBottom: '24px' }} 
                //             />
                            
                //             <Button 
                //                 variant="contained" 
                //                 onClick={connect} 
                //                 fullWidth 
                //                 disabled={!username.trim()}
                //                 sx={{
                //                     padding: '12px',
                //                     fontWeight: 'bold',
                //                     fontSize: '16px',
                //                     backgroundColor: '#1976d2',
                //                     '&:hover': {
                //                         backgroundColor: '#115293'
                //                     }
                //                 }}
                //             >
                //                 Connect
                //             </Button>
                //         </div>
                //     </div>


                //     {/* <div style={{ 
                //         backgroundColor: '#f0f4ff', 
                //         padding: '40px', 
                //         borderRadius: '10px', 
                //         maxWidth: '400px', 
                //         margin: '100px auto', 
                //         textAlign: 'center',
                //         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                //     }}>
                //         <h2 style={{ color: 'blue', marginBottom: '20px' }}>Enter into Lobby</h2>
                        
                //         <TextField 
                //             id="outlined-basic" 
                //             label="Username" 
                //             value={username} 
                //             onChange={e => setUsername(e.target.value)} 
                //             variant="outlined" 
                //             fullWidth 
                //             style={{ marginBottom: '20px' }} 
                //         />
                        
                //         <Button variant="contained" onClick={connect} fullWidth disabled ={!username.trim()}>Connect</Button>
                //     </div> */}

                //     <div>
                //         {/* <video ref={localVideoref} autoPlay muted style = {{display:"none"}}></video> */}
                //         <video 
                //         ref={localVideoref} 
                //         autoPlay 
                //         muted 
                //         playsInline 
                //         style={{ 
                //             marginTop: '30px',
                //             width: '100%', 
                //             maxHeight: '250px',
                //             borderRadius: '12px',
                //             objectFit: 'cover',
                //             boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                //         }} 
                //     />
                //     </div>
                // </div> 
                <LobbyComponent connect={connect} username={username} setUsername={setUsername} localVideoref={localVideoref} />
                ):(
                <div className={styles.meetVideoContainer}>

                    {/* chat */}

                    {/* {showModal ? <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h1>Chat</h1>
                            <Button onClick={closeChat}>Close</Button>
                </div>

                            <div className={styles.chattingDisplay}>

                                {messages.length !== 0 ? messages.map((item, index) => {
                                    
                                    console.log(messages)
                                    return (
                                        <div style={{ marginBottom: "20px", 
                                            textAlign: item.sender === username ? "right" : "left",
                          backgroundColor: item.sender === username ? "#e3f2fd" : "#f5f5f5",
                          padding: "10px",
                          borderRadius: "8px",
                                        }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : (<p>No Messages Yet</p>)}

                            </div>

                            <div className={styles.chattingArea}>
                                <TextField onKeyDown={(e) => e.key === 'Enter' && sendMessage()} value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>
                        </div>
                    </div> 
                    : <></>} */}
                    {/* )} */}

                    {/* {showModal && (
  <div className={styles.chatRoom}>
    <div className={styles.chatContainer}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", padding: "10px 0"
      }}>
        <h2 style={{ margin: 0 }}>Chat Room</h2>
        <Button variant="outlined" onClick={closeChat}>Close</Button>
      </div>

      <div className={styles.chattingDisplay} style={{
        flex: 1,
        overflowY: "auto",
        padding: "15px",
        maxHeight: "400px"
      }}>
        {messages.length ? (
          messages.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "15px",
                textAlign: item.sender === username ? "right" : "left"
              }}
            >
              <div style={{
                display: "inline-block",
                backgroundColor: item.sender === username ? "#c8e6c9" : "#e3f2fd",
                padding: "10px",
                borderRadius: "12px",
                maxWidth: "70%",
                wordWrap: "break-word"
              }}>
                <p style={{ fontWeight: "bold", margin: "0 0 5px" }}>{item.sender}</p>
                <p style={{ margin: 0 }}>{item.data}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#999", textAlign: "center" }}>No messages yet</p>
        )}
      </div>

      <div className={styles.chattingArea} style={{
        display: "flex", gap: "10px", marginTop: "10px", alignItems: "center"
      }}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {if(e.key === 'Enter'){
            e.preventDefault();
            sendMessage();
          } 
        }}
          label="Type a message"
          variant="outlined"
        />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
      </div>
    </div>
  </div>
)} */}

                    <ChatBox
                        showModal={showModal}
                        closeChat={closeChat}
                        messages={messages}
                        username={username}
                        message={message}
                        setMessage={setMessage}
                        sendMessage={sendMessage}
                        addMessage={addMessage}
                        />


                    <div style={{ color: "white", textAlign: "center", marginBottom: "10px" }}>
                        <strong>Participants: {participantCount}</strong>
                    </div>

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>


                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                    
                    {/* {Object.entries(connections).map(([id, peer]) => (
                        <div key={id} className="video-box">
                            <video ref={localVideoref.current[id]} autoPlay playsInline />

                            <div className="username">{users[id]?.username || "Unknown"}</div>
                        </div>
                    ))} */}


                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video

                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                >
                                </video>
                                <div className={styles.usernameOverlay}>{users[video.socketId]?.username || "Guest"}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
