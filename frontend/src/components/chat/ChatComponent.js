import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { ip } from '../../ContentExport';
import axios from 'axios';
import { BsArrowRight } from 'react-icons/bs';
import { Container } from 'react-bootstrap';
function ChatComponent({ userId, userRole, closeChat }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [patientList, setPatientList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [socket, setSocket] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({}); // This will track unread messages for each patient

  const messagesEndRef = useRef(null); // Reference to the end of the chat
  const isPatient = userRole === 'Patient';
  const isMedSec = userRole === 'Medical Secretary';
  const isAdmin = userRole === 'Admin';
  const isMedSecOrAdmin = isMedSec || isAdmin;

  const selectedPatientRef = useRef(selectedPatient);
  const formatTimestamp = (isoDate) => {
    const date = new Date(isoDate); // Convert ISO string to Date object
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Optional: Use 24-hour format
    };
    return date.toLocaleString('en-GB', options).replace(',', '');
  };
  useEffect(() => {
    selectedPatientRef.current = selectedPatient;
  }, [selectedPatient]);

  useEffect(() => {
    if (!userId || !userRole) {
      console.error('User ID or role is not defined.');
      return;
    }

    const newSocket = io(ip.address, { transports: ['websocket'], cors: { origin: '*' } });
    setSocket(newSocket);

    newSocket.emit('identify', { userId: userId.toString(), userRole });

    if (isMedSecOrAdmin) {
      newSocket.on('patient list', (patients) => {
        // console.log('Received patient list:', patients);
        setPatientList(patients);
      });
    }

    newSocket.on('chat message', handleChatMessage);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, userRole]);

  const [lastMessageForPatient, setLastMessageForPatient] = useState({}); // Track the most recent message

  const handleChatMessage = (data) => {
    if (isMedSecOrAdmin) {
      if (
        selectedPatientRef.current &&
        (data.sender === selectedPatientRef.current._id ||
          data.receiver.includes(selectedPatientRef.current._id))
      ) {
        // Add the message to the chat
        setMessages((prevMessages) => {
          if (!prevMessages.find((msg) => msg._id === data._id)) {
            return [...prevMessages, data];
          }
          return prevMessages;
        });
  
        // Reset the unread flag for the selected patient
        setUnreadMessages((prevUnreadMessages) => ({
          ...prevUnreadMessages,
          [data.sender]: false, // Mark as read
        }));
      } else if (data.senderModel === 'Patient') {
        // Track the most recent message for a patient
        setLastMessageForPatient((prevMessages) => ({
          ...prevMessages,
          [data.sender]: data,
        }));
  
        // Set the unread flag only for the patient who has an unread message
        setUnreadMessages((prevUnreadMessages) => ({
          ...prevUnreadMessages,
          [data.sender]: true, // Set as unread for the patient
        }));
      }
      // Removed the code that was adding new patients to the list
    } else if (isPatient) {
      if (data.sender === userId || data.receiver.includes(userId)) {
        setMessages((prevMessages) => {
          if (!prevMessages.find((msg) => msg._id === data._id)) {
            return [...prevMessages, data];
          }
          return prevMessages;
        });
      }
    }
  };
  
  useEffect(() => {
    if (isPatient) {
      fetchMessages();
    } else if (isMedSecOrAdmin && selectedPatient) {
      fetchMessages(selectedPatient._id);
    } else {
      setMessages([]);
    }
  }, [selectedPatient, isPatient, isMedSecOrAdmin]);

  const fetchMessages = async (otherUserId) => {
    try {
      let response;
  
      if (isPatient) {
        response = await axios.get(`${ip.address}/api/chat/messages`, {
          params: {
            userId: userId.toString(),
          },
        });
      } else if (isMedSecOrAdmin && otherUserId) {
        response = await axios.get(`${ip.address}/api/chat/messages`, {
          params: {
            userId: userId.toString(),
            otherUserId: otherUserId.toString(),
          },
        });
      } else {
        return;
      }
  
      if (response.data.success) {
        const messagesData = response.data.data.map((msg) => ({
          ...msg,
          sender: msg.sender.toString(),
          receiver: msg.receiver.map((id) => id.toString()),
        }));
        setMessages(messagesData);
  
        // If messages are successfully fetched, reset unread state for selected patient
        if (isMedSecOrAdmin && selectedPatient) {
          setUnreadMessages((prevUnreadMessages) => ({
            ...prevUnreadMessages,
            [selectedPatient._id]: false, // Reset unread flag after fetching messages
          }));
        }
  
        console.log('Fetched messages:', messagesData);
      } else {
        console.error('Failed to fetch messages:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const sendMessage = () => {
    if (message.trim() !== '') {
      let messageData = {
        senderId: userId.toString(),
        senderModel: userRole,
        message,
      };

      if (isPatient) {
        messageData.receiverModel = 'Staff';
      } else if (isMedSecOrAdmin && selectedPatient) {
        messageData.receiverId = selectedPatient._id.toString();
        messageData.receiverModel = 'Patient';
      } else {
        console.error('Receiver ID or model is not defined.');
        return;
      }

      socket.emit('chat message', messageData);
      setMessage('');
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);

    // Reset unread message flag for the selected patient
    setUnreadMessages((prevUnreadMessages) => ({
      ...prevUnreadMessages,
      [patient._id]: false, // Clear unread flag for the selected patient
    }));
  };

  
  

  // Automatically scrolls to the bottom whenever the messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      {isMedSecOrAdmin && (
        <div className="patient-list">
          <div>
            <Container className='ml-3 mt-3'>
              <h3>Patients</h3>
            </Container>
          </div>


  <ul>
    {patientList.map((patient) => {
      const lastMessage = lastMessageForPatient[patient._id];
      const isUnread = unreadMessages[patient._id]; // Check if the patient has unread messages

      // Only show unread for the most recent message
      const isLatestUnread = lastMessage && isUnread;

      return (
        <li
          key={patient._id}
          onClick={() => handlePatientSelect(patient)}
          className={`${selectedPatient?._id === patient._id ? 'active' : ''} ${isLatestUnread ? 'unread' : ''}`}
        >
          {patient.name}
          {isLatestUnread && (
            <span className="new-message-indicator">•</span> // Red dot indicator for unread
          )}
        </li>
      );
    })}
  </ul>
</div>


    
      )}

      <div className="chat-box">
        <div className="messages">
          {messages.map((msg) => {
            const isSentByCurrentUser = msg.sender === userId.toString();
            const displayName = isSentByCurrentUser ? 'You' : `${msg.senderModel}`;

            return (
              <>
                <div>
                  {!isSentByCurrentUser && (
                    <p style={{ fontSize: '12px', paddingLeft: '4px' }} className="sender-name">
                      {displayName}
                    </p>
                  )}
                </div>

                <div
                  key={msg._id}
                  className={`message ${isSentByCurrentUser ? 'sent' : 'received'}`}
                >
                  <p>{msg.message} <br /></p>
                  <div>
                    <p
                      style={{
                        fontSize: '10px',
                        color: isSentByCurrentUser ? 'white' : 'gray',
                      }}
                    >
                      Sent | {formatTimestamp(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </>
            );
          })}
          <div ref={messagesEndRef} /> {/* Scroll to this element */}
        </div>

        <div className="message-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={!socket || (!isPatient && !selectedPatient)}
          />
          <button onClick={sendMessage} disabled={!socket || (!isPatient && !selectedPatient)}>
            <BsArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatComponent;
