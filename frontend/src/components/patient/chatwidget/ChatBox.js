// ChatBox.js

import React, { useState, useEffect } from "react";
import { Box, IconButton, InputBase, Paper, Typography, Divider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/system";
import { MessageList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import axios from 'axios';
import socket from "../../../socket";

// Custom styling for the chat box and input
const ChatContainer = styled(Box)({
  position: "fixed",
  bottom: "90px",
  right: "50px",
  display: "flex",
  flexDirection: "column",
  height: "600px",
  width: "550px",
  borderRadius: "12px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
  backgroundColor: "#f5f5f5",
  zIndex: 1000,
});

const MessagesContainer = styled(Box)({
  flexGrow: 1,
  padding: "10px",
  overflowY: "auto",
  maxHeight: "500px",
});

const ChatInputContainer = styled(Paper)({
  display: "flex",
  alignItems: "center",
  padding: "5px 10px",
  borderTop: "1px solid #e0e0e0",
});

const StyledInput = styled(InputBase)({
  flexGrow: 1,
  padding: "0 10px",
});

const ChatBox = ({ userId, userRole, receiverId, receiverRole }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    // Connect to the socket server
    socket.connect();

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      if (
        (data.senderId === receiverId && data.senderRole === receiverRole) ||
        (data.senderId === userId && data.senderRole === userRole)
      ) {
        const incomingMessage = {
          position: data.senderId === userId ? "right" : "left",
          type: "text",
          text: data.message,
          date: new Date(data.timestamp),
        };
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }
    });

    // Fetch chat history
    axios
      .get(`/api/chat/messages/${receiverRole}/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const fetchedMessages = response.data.data.map((msg) => ({
          position: msg.sender.toString() === userId ? "right" : "left",
          type: "text",
          text: msg.message,
          date: new Date(msg.createdAt),
        }));
        setMessages(fetchedMessages);
      })
      .catch((error) => {
        console.error('Error fetching chat history:', error);
      });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [userId, userRole, receiverId, receiverRole]);

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;

    const messageData = {
      receiverId: receiverId,
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
      <Typography variant="h6" align="center" sx={{ padding: "10px" }}>
        Chat with {receiverRole}
      </Typography>
      <Divider />
      <MessagesContainer>
        <MessageList
          className="message-list"
          lockable={true}
          toBottomHeight={"100%"}
          dataSource={messages}
        />
      </MessagesContainer>
      <ChatInputContainer elevation={0}>
        <StyledInput
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <IconButton onClick={handleSendMessage} color="primary">
          <SendIcon />
        </IconButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default ChatBox;
