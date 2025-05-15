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

    let localVideoref = useRef(null);

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    const participantCount = videos.length;


    // TODO
    // if(isChrome() === false) 
    // }
    useEffect(() => {
        console.log("HELLO")
        getPermissions();
    })

    // useEffect(() => {
    //     if (username) {
    //         console.log(username);
    //         getMedia(); // or connectToSocketServer directly
    //     }
    //     },);

    // Handle screen sharing state changes
    
//   useEffect(() => {
//     if (screen !== undefined && !askForUsername) {
//       getDisplayMedia()
//     }
//   },)

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

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

        // Ensure getUserMedia is called after state update
    setTimeout(() => {
        getUserMedia(); // Call directly
    }, 100); // small delay to wait for states to update

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
//     useEffect(() => {
//     if (!localVideoref.current) return;

//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//         .then((stream) => {
//             localVideoref.current.srcObject = stream;
//             console.log("Stream set successfully");
//         })
//         .catch(console.error);
// }, []);

//     let getUserMediaSuccess = (stream) => {
//     // Stop previous stream if any
//     try {
//         window.localStream?.getTracks?.().forEach(track => track.stop());
//     } catch (e) {
//         console.log("Error stopping previous stream:", e);
//     }

//     window.localStream = stream;

    
//     // if (localVideoref.current) {
//     //     localVideoref.current.srcObject = stream;
//     // } else {
//     //     console.warn("localVideoref is undefined");
//     //     return;
//     // }

//     // Use addTrack (not addStream) for modern browsers
//     Object.keys(connections).forEach(id => {
//         if (id === socketIdRef.current) return;

//         const pc = connections[id];
//         stream.getTracks().forEach(track => {
//             try {
//                 pc.addTrack(track, stream);
//             } catch (e) {
//                 console.log("addTrack error:", e);
//             }
//         });

//         pc.createOffer().then(desc => {
//             return pc.setLocalDescription(desc);
//         }).then(() => {
//             socketRef.current.emit("signal", id, JSON.stringify({ sdp: pc.localDescription }));
//         }).catch(e => {
//             console.log("Offer error:", e);
//         });
//     });
// };


// let getUserMedia = () => {
//     if ((video && videoAvailable) || (audio && audioAvailable)) {
//         navigator.mediaDevices.getUserMedia({ video, audio })
//             .then(getUserMediaSuccess)
//             .catch((e) => console.log("getUserMedia error:", e));
//     } else {
//         try {
//             let tracks = localVideoref.current?.srcObject?.getTracks?.() || [];
//             tracks.forEach(track => track.stop());
//         } catch (e) {
//             console.log("Cleanup error:", e);
//         }
//     }
// };


// // Call it after a small delay if needed
// setTimeout(() => {
//     getUserMedia();
// }, 100);



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
            } catch (e) {
                console.log(e);
             }
        }
    };

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

//     const getDisplayMedia = () => {
//     if (screen && navigator.mediaDevices.getDisplayMedia) {
//       navigator.mediaDevices
//         .getDisplayMedia({ video: true, audio: true })
//         .then(getDisplayMediaSuccess)
//         .catch((e) => console.log("getDisplayMedia error:", e))
//     }
//   } 

// chat related
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
            console.log("Emitting join-call with username:", username)
            socketRef.current.emit('join-call', window.location.href, {
                path: window.location.pathname,
                username: username || "Guest"
            });
            socketIdRef.current = socketRef.current.id

            // socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
            //     console.log("Received chat message:", data, sender);
            //     addMessage(data, sender, socketIdSender);

            // if (!showModal) {
            //     setNewMessages(prev => prev + 1); // only increase if chat is closed
            // }
            // });
            

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                // setParticipantCount(prev => Math.max(1,prev - 1));
            })

            socketRef.current.on('user-joined', ({id, username: remoteUsername }, clients) => {
                console.log("received User joined:", remoteUsername);
                // Save the username
                setUsers(prev => ({
                    ...prev,
                    [id]: { username: remoteUsername || "Guest" },
                }));

                console.log("Username in connectToSocketServer:", username);


                // Set up peer connection etc...
                clients.forEach((socketListId) => {
                    // if(!connections[socketListId]) {
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
                                // setParticipantCount(prev => prev + 1);
                                return updatedVideos;
                                
                            });
                        }
                    };

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                    // }
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
        window.location.href = "/home"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
    console.log("Adding message:", data, sender, socketIdSender)

    setMessages((prevMessages) => [...prevMessages, { sender: sender || "Unknown", data: data }])

    if (socketIdSender !== socketIdRef.current && !showModal) {
      setNewMessages((prev) => prev + 1)
    }
  };

    const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;

    console.log("Sending message:", message, username)
    socketRef.current.emit("chat-message", message, username)
    setMessage("");
  }
    
    const connect = async (username) => {
        if (!username.trim()) {
            alert("Please enter a username")
            return;
        }
        setAskForUsername(false);
        setUsername(username);

        await getPermissions();
        getMedia();
    };


    return (
        <div>

            {askForUsername === true ?(
                // entering the meeting
                <LobbyComponent connect={connect} username={username} setUsername={setUsername} localVideoref={localVideoref} />
                ):(
                <div className={styles.meetVideoContainer}>

                    {/* chat */}
                    
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

                        <Badge badgeContent={newMessages} sx={{ "& .MuiBadge-badge": { backgroundColor: 'orange', color: 'white' } }}>

                            <IconButton onClick={() => {
                                setModal(prev => {
                                    const nextState = !prev;
                                    if (nextState) {
                                        setNewMessages(0); // reset badge count when modal opens
                                    }
                                    return nextState;
                                });
                            }} style={{ color: "white" }}>

                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>


                    <video 
                    ref={localVideoref} autoPlay 
                    muted
                    className={styles.meetUserVideo}
                    >
                    </video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId} className={styles.remoteVideoContainer}>
                                <video
                                    className={styles.remoteVideo}
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    muted={video.isSelf}
                                >
                                </video>
                                {!video.stream && (
                                    <div className={styles.noStreamOverlay}>No video</div>
                                )}

                                <div className={styles.usernameOverlay}>{users[video.socketId]?.username || "Guest"}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}