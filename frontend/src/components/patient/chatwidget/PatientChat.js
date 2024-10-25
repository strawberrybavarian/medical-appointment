// PatientChat.js

import React, { useState, useEffect } from "react";
import { Box, IconButton, InputBase, Paper, Typography, Divider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/system";
import { MessageList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import socket from "../../../socket";

// Custom styling
const ChatContainer = styled(Box)({ /* styles */ });
const MessagesContainer = styled(Box)({ /* styles */ });
const ChatInputContainer = styled(Paper)({ /* styles */ });
const StyledInput = styled(InputBase)({ /* styles */ });

const PatientChat = ({ userId, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const receiverRole = 'MedicalSecretary';

  useEffect(() => {
    socket.connect();

    // Join a room based on user ID
    socket.emit("joinRoom", { userId, userRole });

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      if (data.senderRole === 'MedicalSecretary') {
        const incomingMessage = {
          position: "left",
          type: "text",
          text: data.message,
          date: new Date(data.timestamp),
        };
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, userRole]);

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;

    const messageData = {
      receiverId: null, // No specific receiverId
      receiverRole: receiverRole,
      message: messageText,
    };

    // Emit the message to the server
    socket.emit("sendMessage", messageData);

    // Add the message to the chat box
    const newMessage = {
      position: "right",
      type: "text",
      text: messageText,
      date: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Clear the input field
    setMessageText("");
  };

  return (
    <ChatContainer>
      {/* Chat UI */}
    </ChatContainer>
  );
};

export default PatientChat;
