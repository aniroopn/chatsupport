'use client';

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { auth } from './firebase';  // Import the Firebase auth instance
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Workout Advice Chatbot. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return; // Don't send empty messages
    setIsLoading(true);
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }] }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.error('Error signing in with Google:', error);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundImage: `url('/path/to/your/workout-themed-background.jpg')`, // Replace with your background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {user ? (
        <>
          <Stack
            direction={'column'}
            width="500px"
            height="700px"
            border="2px solid #007BFF"
            p={2}
            spacing={3}
            bgcolor="rgba(255, 255, 255, 0.9)"
            boxShadow="0px 4px 20px rgba(0, 123, 255, 0.1)"
            borderRadius="16px"
            position="relative"
          >
            <Stack
              direction={'column'}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
              mt={6} // To give space for the avatar
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  }
                >
                  <Box
                    bgcolor={
                      message.role === 'assistant'
                        ? '#007BFF'
                        : '#28A745'
                    }
                    color="white"
                    borderRadius={16}
                    p={3}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>
            <Stack direction={'row'} spacing={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                  bgcolor: '#f0f4f7',
                  borderRadius: '8px',
                }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                sx={{
                  bgcolor: '#007BFF',
                  ':hover': { bgcolor: '#0056b3' },
                }}
              >
                Send
              </Button>
            </Stack>
            <Button
              variant="contained"
              onClick={handleSignOut}
              sx={{
                bgcolor: '#FF5733',
                ':hover': { bgcolor: '#C70039' },
                mt: 2,
              }}
            >
              Sign Out
            </Button>
          </Stack>
        </>
      ) : (
        <Button
          variant="contained"
          onClick={handleGoogleSignIn}
          sx={{
            background: 'linear-gradient(90deg, #4285F4 25%, #EA4335 25%, #FBBC05 50%, #34A853 50%, #34A853 75%, #4285F4 75%)',
            color: 'white',
            ':hover': {
              background: 'linear-gradient(90deg, #357AE8 25%, #CC3333 25%, #E6B800 50%, #2D9B3A 50%, #2D9B3A 75%, #357AE8 75%)',
            },
          }}
        >
          Sign in with Google
        </Button>
      )}
    </Box>
  );
}
