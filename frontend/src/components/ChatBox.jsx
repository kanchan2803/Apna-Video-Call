import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const ChatBox = ({
  showModal,
  closeChat,
  messages,
  username,
  message,
  setMessage,
  sendMessage,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!showModal) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        zIndex: 1300,
        backgroundColor: '#fff',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#1976d2',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <Typography variant="h6">Chat</Typography>
        <IconButton size="small" onClick={closeChat} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          padding: '10px',
          overflowY: 'auto',
          backgroundColor: '#f5f5f5',
        }}
      >
        {messages.length > 0 ? (
          messages.map((item, index) => {
            const isMine = item.sender === username;
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: '10px',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: isMine ? '#1976d2' : '#e0e0e0',
                    color: isMine ? '#fff' : '#000',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '70%',
                    wordWrap: 'break-word',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {item.sender}
                  </Typography>
                  <Typography variant="body2">{item.data}</Typography>
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography align="center" sx={{ color: '#777' }}>
            No messages yet
          </Typography>
        )}
        <div ref={chatEndRef} />
      </Box>

      {/* Input + Emoji + Send */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderTop: '1px solid #ddd',
          backgroundColor: '#fafafa',
        }}
      >
        <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
          <EmojiEmotionsIcon />
        </IconButton>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Type a message"
          fullWidth
          value={message || ""}
          onChange={(e) => {
            setMessage(e.target.value);
            if(showEmojiPicker)
              setShowEmojiPicker(false);
            }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
              setShowEmojiPicker(false);
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            sendMessage();
            setShowEmojiPicker(false);
          }}
          sx={{ marginLeft: 1 }}
        >
          Send
        </Button>
      </Box>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 70,
            right: 10,
            zIndex: 1400,
          }}
        >
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </Box>
      )}
    </Paper>
  );
};

export default ChatBox;
