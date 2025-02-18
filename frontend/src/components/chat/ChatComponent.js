import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

import { ip } from '../../ContentExport';
import axios from 'axios';
import { BsArrowRight } from 'react-icons/bs';

function ChatComponent({ userId, userRole, closeChat }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [patientList, setPatientList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [socket, setSocket] = useState(null);

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

  const handleChatMessage = (data) => {
    // console.log('Received chat message:', data);

    if (isMedSecOrAdmin) {
      if (
        selectedPatientRef.current &&
        (data.sender === selectedPatientRef.current._id ||
          data.receiver.includes(selectedPatientRef.current._id))
      ) {
        setMessages((prevMessages) => {
          if (!prevMessages.find((msg) => msg._id === data._id)) {
            return [...prevMessages, data];
          }
          return prevMessages;
        });
      }

      // Do not add a new patient if already in the list
      if (
        data.senderModel === 'Patient' &&
        !patientList.some((p) => p._id === data.sender)
      ) {
        setPatientList((prevList) => [
          ...prevList,
          { _id: data.sender, name: data.senderName || 'Unknown Patient' },
        ]);
      }
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
