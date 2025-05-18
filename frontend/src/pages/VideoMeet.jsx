"use client"

import { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import { Badge, IconButton } from "@mui/material"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import styles from "../styles/videoComponent.module.css"
import CallEndIcon from "@mui/icons-material/CallEnd"
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import ChatIcon from "@mui/icons-material/Chat"
import server from "../environment"
import LobbyComponent from "../components/LobbyComponent"
import ChatBox from "../components/ChatBox"

const server_url = server

var connections = {}
var dataChannels = {} // Store data channels for direct peer communication

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export default function VideoMeetComponent() {
  var socketRef = useRef()
  const [usernames, setUsernames] = useState({})
  const socketIdRef = useRef()

  const localVideoref = useRef(null)

  const [videoAvailable, setVideoAvailable] = useState(true)

  const [audioAvailable, setAudioAvailable] = useState(true)

  const [video, setVideo] = useState(true)

  const [audio, setAudio] = useState(true)

  const [screen, setScreen] = useState(false)

  const [showModal, setModal] = useState(false)

  const [screenAvailable, setScreenAvailable] = useState(false)

  const [messages, setMessages] = useState([])

  const [message, setMessage] = useState("")

  const [newMessages, setNewMessages] = useState(0)

  const [askForUsername, setAskForUsername] = useState(true)

  const [username, setUsername] = useState("")

  const videoRef = useRef([])

  const [videos, setVideos] = useState([])

  // Filter out any videos that might be our own
  const filteredVideos = videos.filter((video) => video.socketId !== socketIdRef.current)

  // Participant count includes local user plus remote users
  const participantCount = filteredVideos.length + 1

  // Clean up function to handle component unmount
  useEffect(() => {
    return () => {
      // Clean up connections
      for (const id in connections) {
        if (connections[id]) {
          connections[id].close()
          delete connections[id]
        }
      }

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      // Stop all tracks
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Send username to all peers via data channels
  const broadcastUsername = () => {
    console.log("Broadcasting username to all peers:", username)

    // Store our own username
    setUsernames((prev) => ({
      ...prev,
      [socketIdRef.current]: username,
    }))

    // Send to all connected peers
    for (const id in dataChannels) {
      if (dataChannels[id] && dataChannels[id].readyState === "open") {
        try {
          const message = JSON.stringify({
            type: "username",
            username: username,
            id: socketIdRef.current,
          })
          dataChannels[id].send(message)
          console.log("Sent username to peer:", id)
        } catch (e) {
          console.error("Error sending username to peer:", id, e)
        }
      }
    }
  }

  // Create a data channel for a peer connection
  const createDataChannel = (peerId, pc) => {
    try {
      console.log("Creating data channel for peer:", peerId)
      const dataChannel = pc.createDataChannel("usernameChannel")

      dataChannel.onopen = () => {
        console.log("Data channel opened with peer:", peerId)
        dataChannels[peerId] = dataChannel

        // Send our username as soon as the channel opens
        try {
          const message = JSON.stringify({
            type: "username",
            username: username,
            id: socketIdRef.current,
          })
          dataChannel.send(message)
          console.log("Sent initial username to peer:", peerId)
        } catch (e) {
          console.error("Error sending initial username:", e)
        }
      }

      dataChannel.onclose = () => {
        console.log("Data channel closed with peer:", peerId)
        delete dataChannels[peerId]
      }

      dataChannel.onerror = (error) => {
        console.error("Data channel error with peer:", peerId, error)
      }

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "username") {
            console.log("Received username from peer:", data.id, data.username)
            setUsernames((prev) => ({
              ...prev,
              [data.id]: data.username,
            }))
          }
        } catch (e) {
          console.error("Error processing data channel message:", e)
        }
      }

      return dataChannel
    } catch (e) {
      console.error("Error creating data channel:", e)
      return null
    }
  }

  // Handle incoming data channel
  const handleDataChannel = (event, peerId) => {
    const dataChannel = event.channel
    console.log("Received data channel from peer:", peerId)

    dataChannel.onopen = () => {
      console.log("Received data channel opened with peer:", peerId)
      dataChannels[peerId] = dataChannel

      // Send our username as soon as the channel opens
      try {
        const message = JSON.stringify({
          type: "username",
          username: username,
          id: socketIdRef.current,
        })
        dataChannel.send(message)
        console.log("Sent username response to peer:", peerId)
      } catch (e) {
        console.error("Error sending username response:", e)
      }
    }

    dataChannel.onclose = () => {
      console.log("Received data channel closed with peer:", peerId)
      delete dataChannels[peerId]
    }

    dataChannel.onerror = (error) => {
      console.error("Received data channel error with peer:", peerId, error)
    }

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "username") {
          console.log("Received username from peer:", data.id, data.username)
          setUsernames((prev) => ({
            ...prev,
            [data.id]: data.username,
          }))
        }
      } catch (e) {
        console.error("Error processing received data channel message:", e)
      }
    }
  }

  const getPermissions = async () => {
    try {
      // Check video permission
      try {
        const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true })
        setVideoAvailable(true)
        videoPermission.getTracks().forEach((track) => track.stop()) // Stop tracks after permission check
        console.log("Video permission granted")
      } catch (e) {
        setVideoAvailable(false)
        console.log("Video permission denied", e)
      }

      // Check audio permission
      try {
        const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true })
        setAudioAvailable(true)
        audioPermission.getTracks().forEach((track) => track.stop()) // Stop tracks after permission check
        console.log("Audio permission granted")
      } catch (e) {
        setAudioAvailable(false)
        console.log("Audio permission denied", e)
      }

      // Check screen sharing availability
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true)
      } else {
        setScreenAvailable(false)
      }
    } catch (error) {
      console.log("Error getting permissions:", error)
    }
  }

  const getUserMedia = async () => {
    console.log("Getting user media with video:", video, "audio:", audio)

    try {
      // Stop any existing tracks
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop())
      }

      // Only request media if video or audio is enabled
      if ((video && videoAvailable) || (audio && audioAvailable)) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: video && videoAvailable,
          audio: audio && audioAvailable,
        })

        window.localStream = stream

        if (localVideoref.current) {
          localVideoref.current.srcObject = stream
        }

        // Update connections with new stream
        for (const id in connections) {
          if (id === socketIdRef.current) continue

          try {
            // Try to replace tracks first
            const senders = connections[id].getSenders()

            if (senders.length > 0) {
              senders.forEach((sender) => {
                if (sender.track.kind === "video" && stream.getVideoTracks().length > 0) {
                  sender.replaceTrack(stream.getVideoTracks()[0])
                }
                if (sender.track.kind === "audio" && stream.getAudioTracks().length > 0) {
                  sender.replaceTrack(stream.getAudioTracks()[0])
                }
              })
            } else {
              // If we can't replace tracks, try removing and adding the stream
              try {
                if (connections[id].getLocalStreams().length > 0) {
                  connections[id].removeStream(connections[id].getLocalStreams()[0])
                }
                connections[id].addStream(stream)

                // Renegotiate after changing stream
                connections[id]
                  .createOffer()
                  .then((description) => {
                    connections[id]
                      .setLocalDescription(description)
                      .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }))
                      })
                      .catch((e) => console.log(e))
                  })
                  .catch((e) => console.log(e))
              } catch (err) {
                console.log("Error updating stream", err)
              }
            }
          } catch (e) {
            console.log("Error replacing track", e)
          }
        }

        console.log("User media obtained successfully")
      } else {
        // Create black video and silent audio if both are disabled
        const blackSilence = (...args) => new MediaStream([black(...args), silence()])
        window.localStream = blackSilence()
        localVideoref.current.srcObject = window.localStream

        console.log("Created black/silent stream because video and audio are disabled")
      }
    } catch (e) {
      console.log("Error getting user media:", e)
    }
  }

  const getMedia = async () => {
    await getPermissions()

    // Set initial states
    setVideo(videoAvailable)
    setAudio(audioAvailable)

    // Get user media
    await getUserMedia()

    // Connect to socket server
    connectToSocketServer()
  }

  const handleVideo = () => {
    console.log("Video button clicked, current state:", video)

    const newVideoState = !video
    setVideo(newVideoState)

    if (window.localStream) {
      const videoTracks = window.localStream.getVideoTracks()

      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = newVideoState
          console.log("Video track enabled set to:", newVideoState)
        })
      } else if (newVideoState) {
        // If we're turning video on but there are no video tracks, we need to get new user media
        getUserMedia()
      }
    } else if (newVideoState) {
      // If there's no local stream but we're turning video on, get user media
      getUserMedia()
    }
  }

  const handleAudio = () => {
    console.log("Audio button clicked, current state:", audio)

    const newAudioState = !audio
    setAudio(newAudioState)

    if (window.localStream) {
      const audioTracks = window.localStream.getAudioTracks()

      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = newAudioState
          console.log("Audio track enabled set to:", newAudioState)
        })
      } else if (newAudioState) {
        // If we're turning audio on but there are no audio tracks, we need to get new user media
        getUserMedia()
      }
    } else if (newAudioState) {
      // If there's no local stream but we're turning audio on, get user media
      getUserMedia()
    }
  }

  const getDisplayMedia = async () => {
    if (screen) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        // Stop existing tracks
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => track.stop())
        }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        // Handle when user stops screen sharing
        stream.getVideoTracks()[0].onended = () => {
          setScreen(false)
          getUserMedia()
        }

        // Update connections with new stream
        for (const id in connections) {
          if (id === socketIdRef.current) continue

          try {
            // Try to replace tracks first
            const senders = connections[id].getSenders()
            const videoSender = senders.find((sender) => sender.track && sender.track.kind === "video")

            if (videoSender && stream.getVideoTracks().length > 0) {
              videoSender.replaceTrack(stream.getVideoTracks()[0])
            } else {
              // If we can't replace tracks, try removing and adding the stream
              try {
                connections[id].removeStream(connections[id].getLocalStreams()[0])
                connections[id].addStream(stream)

                // Renegotiate after changing stream
                connections[id]
                  .createOffer()
                  .then((description) => {
                    connections[id]
                      .setLocalDescription(description)
                      .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }))
                      })
                      .catch((e) => console.log(e))
                  })
                  .catch((e) => console.log(e))
              } catch (err) {
                console.log("Error adding screen share stream", err)
              }
            }
          } catch (e) {
            console.log("Error replacing track for screen share", e)
          }
        }

        console.log("Screen sharing started")
      } catch (e) {
        console.log("Error getting display media:", e)
        setScreen(false)
      }
    } else {
      // If screen sharing is turned off, go back to camera
      getUserMedia()
    }
  }

  useEffect(() => {
    if (screen !== undefined && !askForUsername) {
      getDisplayMedia()
    }
  }, [screen])

  const handleScreen = () => {
    setScreen(!screen)
  }

  const silence = () => {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext("2d").fillRect(0, 0, width, height)
    const stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  const connectToSocketServer = () => {
    // Disconnect any existing socket connection
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    // Clear existing connections
    for (const id in connections) {
      if (connections[id]) {
        connections[id].close()
        delete connections[id]
      }
    }

    // Connect to socket server
    socketRef.current = io.connect(server_url, { secure: false })

    socketRef.current.on("signal", gotMessageFromServer)

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server with ID:", socketRef.current.id)

      socketIdRef.current = socketRef.current.id

      // Store our own username
      setUsernames((prev) => ({
        ...prev,
        [socketRef.current.id]: username,
      }))

      // Send username to server
      socketRef.current.emit("set-username", username)

      // Join the call
      socketRef.current.emit("join-call", window.location.pathname)

      // Handle chat messages
      socketRef.current.on("chat-message", addMessage)

      // Handle user leaving
      socketRef.current.on("user-left", (id) => {
        console.log("User left:", id)
        setVideos((videos) => videos.filter((video) => video.socketId !== id))

        // Remove username when user leaves
        setUsernames((prev) => {
          const newUsernames = { ...prev }
          delete newUsernames[id]
          return newUsernames
        })

        // Clean up connection and data channel
        if (dataChannels[id]) {
          delete dataChannels[id]
        }

        if (connections[id]) {
          connections[id].close()
          delete connections[id]
        }
      })

      // Handle new user joining
      socketRef.current.on("user-joined", (id, clients) => {
        console.log("User joined:", id)

        // Set up peer connections for all clients
        clients.forEach((socketListId) => {
          if (connections[socketListId]) {
            console.log("Connection already exists for", socketListId)
            return
          }

          console.log("Creating new connection for", socketListId)

          // Create new RTCPeerConnection
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

          // Create data channel for username exchange
          if (socketListId !== socketIdRef.current) {
            // Only create data channel if we're the initiator (to avoid both sides creating one)
            if (id === socketIdRef.current) {
              createDataChannel(socketListId, connections[socketListId])
            }

            // Handle incoming data channel
            connections[socketListId].ondatachannel = (event) => {
              handleDataChannel(event, socketListId)
            }
          }

          // Handle ICE candidates
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }))
            }
          }

          // Handle incoming stream
          connections[socketListId].onaddstream = (event) => {
            console.log("Received stream from:", socketListId)
            console.log("Username for this stream:", usernames[socketListId] || "Guest")

            // Check if we already have this video
            const existingVideoIndex = videos.findIndex((v) => v.socketId === socketListId)

            if (existingVideoIndex !== -1) {
              // Update existing video
              setVideos((prevVideos) => {
                const newVideos = [...prevVideos]
                newVideos[existingVideoIndex].stream = event.stream
                return newVideos
              })
            } else {
              // Add new video
              const newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              }

              setVideos((prevVideos) => [...prevVideos, newVideo])
            }
          }

          // Add local stream to connection
          if (window.localStream) {
            connections[socketListId].addStream(window.localStream)
          } else {
            console.log("No local stream to add")
          }
        })

        // If we're the one who just joined, initiate offers to everyone
        if (id === socketIdRef.current) {
          for (const id2 in connections) {
            if (id2 === socketIdRef.current) continue

            try {
              // Create and send offer
              connections[id2]
                .createOffer()
                .then((description) => {
                  connections[id2]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }))
                    })
                    .catch((e) => console.log("Error setting local description:", e))
                })
                .catch((e) => console.log("Error creating offer:", e))
            } catch (e) {
              console.log("Error in offer creation process:", e)
            }
          }
        }
      })
    })
  }

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({ sdp: connections[fromId].localDescription }),
                      )
                    })
                    .catch((e) => console.log(e))
                })
                .catch((e) => console.log(e))
            }
          })
          .catch((e) => console.log(e))
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e))
      }
    }
  }

  const handleEndCall = () => {
    try {
      // Stop all tracks
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop())
      }

      // Close all connections
      for (const id in connections) {
        connections[id].close()
      }

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    } catch (e) {
      console.log("Error ending call:", e)
    }

    // Redirect to home
    window.location.href = "/home"
  }

  const openChat = () => {
    setModal(true)
    setNewMessages(0)
  }

  const closeChat = () => {
    setModal(false)
  }

  const handleMessage = (e) => {
    setMessage(e.target.value)
  }

  const addMessage = (data, sender, socketIdSender) => {
    console.log("Adding message:", data, sender, socketIdSender)

    // Check if this message is already in the list to prevent duplicates
    const isDuplicate = messages.some(
      (msg) => msg.data === data && msg.sender === sender && msg.socketIdSender === socketIdSender,
    )

    if (!isDuplicate) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: sender || "Unknown",
          data: data,
          socketIdSender: socketIdSender,
        },
      ])

      if (socketIdSender !== socketIdRef.current && !showModal) {
        setNewMessages((prev) => prev + 1)
      }
    } else {
      console.log("Duplicate message detected and ignored")
    }
  }

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return

    console.log("Sending message:", message, username)
    socketRef.current.emit("chat-message", message, username)
    setMessage("")
  }

  const connect = async (username) => {
    if (!username.trim()) {
      alert("Please enter a username")
      return
    }

    setAskForUsername(false)
    setUsername(username)

    // Start media and connect to socket server
    await getMedia()
  }

  // Broadcast username whenever it changes
  useEffect(() => {
    if (!askForUsername && username && socketRef.current) {
      broadcastUsername()
    }
  }, [username, askForUsername])

  return (
    <div>
      {askForUsername === true ? (
        // entering the meeting
        <LobbyComponent connect={connect} username={username} setUsername={setUsername} localVideoref={localVideoref} />
      ) : (
        <div className={`${styles.meetVideoContainer} ${showModal ? styles.chatOpen : ""}`}>
          <div className={styles.videoAndChatWrapper}>
            <div className={styles.videoSection}>
              <div style={{ color: "white", textAlign: "center", marginBottom: "10px" }}>
                <strong>Participants: {participantCount}</strong>
              </div>

              <div className={styles.buttonContainers}>
                <IconButton onClick={handleVideo} style={{ color: "white" }}>
                  {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
                <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                  <CallEndIcon />
                </IconButton>
                <IconButton onClick={handleAudio} style={{ color: "white" }}>
                  {audio === true ? <MicIcon /> : <MicOffIcon />}
                </IconButton>

                {screenAvailable === true ? (
                  <IconButton onClick={handleScreen} style={{ color: "white" }}>
                    {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                  </IconButton>
                ) : (
                  <></>
                )}

                <Badge
                  badgeContent={newMessages}
                  sx={{ "& .MuiBadge-badge": { backgroundColor: "orange", color: "white" } }}
                >
                  <IconButton
                    onClick={() => {
                      setModal((prev) => {
                        const nextState = !prev
                        if (nextState) {
                          setNewMessages(0) // reset badge count when modal opens
                        }
                        return nextState
                      })
                    }}
                    style={{ color: "white" }}
                  >
                    <ChatIcon />
                  </IconButton>
                </Badge>
              </div>

              <div className={`${styles.localVideoContainer} ${showModal ? styles.chatOpen : ""}`}>
                <video ref={localVideoref} autoPlay muted className={styles.meetUserVideo}></video>
                <div className={styles.usernameOverlay}>{username || "You"} (You)</div>
              </div>

              <div className={styles.conferenceView}>
                {filteredVideos.map((video) => (
                  <div key={video.socketId} className={styles.remoteVideoContainer}>
                    <video
                      className={styles.remoteVideo}
                      data-socket={video.socketId}
                      ref={(ref) => {
                        if (ref && video.stream) {
                          ref.srcObject = video.stream
                        }
                      }}
                      autoPlay
                      playsInline
                    ></video>
                    {!video.stream && <div className={styles.noStreamOverlay}>No video</div>}

                    <div className={styles.usernameOverlay}>{usernames[video.socketId] || "Guest"}</div>
                  </div>
                ))}
              </div>
            </div>

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
          </div>
        </div>
      )}
    </div>
  )
}
