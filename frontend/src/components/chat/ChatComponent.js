// ChatComponent.js

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './ChatComponent.css';
import { ip } from '../../ContentExport';
import axios from 'axios';
import { BsArrowRight } from 'react-icons/bs'; // Importing icon for send button

function ChatComponent({ userId, userRole, closeChat }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [patientList, setPatientList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [socket, setSocket] = useState(null);

  const isPatient = userRole === 'Patient';
  const isMedSec = userRole === 'Medical Secretary';
  const isAdmin = userRole === 'Admin';
  const isMedSecOrAdmin = isMedSec || isAdmin;

  // Use refs to keep track of selectedPatient
  const selectedPatientRef = useRef(selectedPatient);

  useEffect(() => {
    selectedPatientRef.current = selectedPatient;
  }, [selectedPatient]);

  useEffect(() => {
    if (!userId || !userRole) {
      console.error('User ID or role is not defined.');
      return;
    }

    // Connect to socket server
    const newSocket = io(ip.address, {
      transports: ['websocket'],
      cors: {
        origin: '*',
      },
    });
    setSocket(newSocket);

    // Authenticate the user with the server
    newSocket.emit('identify', { userId, userRole });

    // Receive the list of patients who have chatted
    if (isMedSecOrAdmin) {
      newSocket.on('patient list', (patients) => {
        console.log('Received patient list:', patients);
        setPatientList(patients);
      });
    }

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId, userRole]);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data) => {
      console.log('Received chat message:', data);

      if (isMedSecOrAdmin) {
        // Check if the message is relevant to the selected patient
        if (
          (data.senderModel === 'Patient' && data.sender === selectedPatientRef.current?._id) ||
          (data.receiver.includes(selectedPatientRef.current?._id) && data.sender === userId)
        ) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
        // Add patient to the list if not already present
        if (
          data.senderModel === 'Patient' &&
          !patientList.find((p) => p._id === data.sender)
        ) {
          setPatientList((prevList) => [
            ...prevList,
            { _id: data.sender, name: data.senderName || 'Unknown Patient' },
          ]);
        }
      } else if (isPatient) {
        if (data.sender === userId || data.receiver.includes(userId)) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      }
    };

    socket.on('chat message', handleChatMessage);

    return () => {
      socket.off('chat message', handleChatMessage);
    };
  }, [socket, isPatient, isMedSecOrAdmin, userId, patientList]);

  useEffect(() => {
    if (isPatient) {
      fetchMessages();
    } else if (isMedSecOrAdmin && selectedPatient) {
      fetchMessages(selectedPatient._id);
    } else {
      setMessages([]); // Clear messages if no patient is selected
    }
  }, [selectedPatient, isPatient, isMedSecOrAdmin]);

  const fetchMessages = async (otherUserId) => {
    try {
      let response;

      if (isPatient) {
        response = await axios.get(`${ip.address}/api/chat/messages`, {
          params: {
            userId: userId,
            receiverModel: 'Staff', // Adjusted to 'Staff' to include both MedSec and Admin
          },
        });
      } else if (isMedSecOrAdmin && otherUserId) {
        response = await axios.get(`${ip.address}/api/chat/messages`, {
          params: {
            userId: userId,
            otherUserId: otherUserId,
          },
        });
      } else {
        return;
      }

      if (response.data.success) {
        setMessages(response.data.data);
        console.log('Fetched messages:', response.data.data);
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
        senderId: userId,
        senderModel: userRole,
        message,
      };

      if (isPatient) {
        messageData.receiverModel = 'Staff'; // Adjusted to 'Staff' to include both MedSec and Admin
      } else if (isMedSecOrAdmin && selectedPatient) {
        messageData.receiverId = selectedPatient._id;
        messageData.receiverModel = 'Patient';
      } else {
        console.error('Receiver ID or model is not defined.');
        return;
      }

      socket.emit('chat message', messageData);

      // Remove optimistic update to prevent duplicate messages

      setMessage('');
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="chat-container">
      {isMedSecOrAdmin && (
        <div className="patient-list">
          <h3>Patients</h3>
          <ul>
            {patientList.map((patient) => (
              <li
                key={patient._id}
                onClick={() => handlePatientSelect(patient)}
                className={selectedPatient?._id === patient._id ? 'active' : ''}
              >
                {patient.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="chat-box">
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === userId ? 'sent' : 'received'}`}
            >
              <p>{msg.message}</p>
            </div>
          ))}
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
