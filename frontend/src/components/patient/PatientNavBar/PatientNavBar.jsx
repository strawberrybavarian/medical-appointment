// PatientNavBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import './PatientNavBar.css';
import { usePatient } from '../PatientContext';
import { image, ip } from '../../../ContentExport';
import axios from 'axios';
import io from 'socket.io-client';

function PatientNavBar({ pid }) {
  const navigate = useNavigate();
  const { patient, setPatient } = usePatient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [theImage, setImage] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const defaultImage = `${ip.address}/images/default-profile.jpg`;

  // Use useRef to maintain the socket instance
  const socketRef = useRef();

  // Initialize socket.io client
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(ip.address); // Ensure ip.address includes protocol and port

    // Handle socket connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Identify the user to the server
    socketRef.current.emit('identify', { userId: pid, userRole: 'Patient' });

    // Listen for socket events
    socketRef.current.on('newNews', (data) => {
      console.log('Received newNews event:', data);
      // Create a new notification object
      const notification = {
        _id: Date.now().toString(), // Generate a unique ID
        message: data.message,
        isRead: false,
        link: data.link,
        type: 'News',
      };
      // Update the notifications state
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);

      // Show browser notification
      showBrowserNotification(data.message);
    });

    socketRef.current.on('appointmentStatusUpdate', (data) => {
      console.log('Received appointmentStatusUpdate event:', data);
      // Check if the notification is for this patient
      if (data.patientId === pid) {
        const notification = {
          _id: Date.now().toString(),
          message: data.message,
          isRead: false,
          link: data.link, // Use link from data
          type: 'StatusUpdate',
        };
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);

        // Show browser notification
        showBrowserNotification(data.message);
      }
    });

    // Handle socket disconnection
    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Handle socket reconnection
    socketRef.current.io.on('reconnect', () => {
      console.log('Socket reconnected');
      socketRef.current.emit('identify', { userId: pid, userRole: 'Patient' });
    });

    // Clean up on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [pid]);

  // Request browser notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch patient data and notifications
  useEffect(() => {
    axios
      .get(`${ip.address}/api/patient/api/onepatient/${pid}`)
      .then((res) => {
        const patientData = res.data.thePatient;
        setImage(patientData.patient_image || defaultImage);
        setNotifications(patientData.notifications || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [pid]);

  const logoutUser = () => {
    setPatient(null);
    localStorage.removeItem('patient');
    navigate('/medapp/login');
  };

  const onClickHomepage = () => {
    navigate(`/homepage`, { state: { pid: patient._id } });
  };

  const onButtonContainerClick = () => {
    navigate(`/choosedoctor`, { state: { pid: patient._id } });
  };

  const MyAppointment = () => {
    navigate(`/myappointment`, { state: { pid: patient._id } });
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (notification) => {
    try {
      console.log('Notification clicked:', notification);

      // Navigate to the link if it exists
      if (notification.link) {
        navigate(notification.link);
      } else {
        console.warn('No link found in notification:', notification);
      }

      // Mark notification as read
      await axios.put(`${ip.address}/api/notifications/${notification._id}/read`);

      // Update the notification state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notification._id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to show browser notification
  const showBrowserNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Notification', {
        body: message,
        icon: image.logo || defaultImage,
      });
    }
  };

  return (
    <Navbar
      fluid
      expand="md"
      className="nav-bar-no-color navbar-fixed-top fixed-top px-5 py-0"
      style={{ zIndex: '2' }}
    >
      <Container fluid>
        <Link to={{ pathname: `/homepage`, state: { pid: patient._id } }}>
          <img className="molino-logo" src={image.logo || defaultImage} alt="Logo" />
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link className="pnb-nav-link" onClick={onClickHomepage}>
              Home
            </Nav.Link>
            <Nav.Link className="pnb-nav-link" onClick={MyAppointment}>
              My Appointments
            </Nav.Link>
            <Nav.Link className="pnb-nav-link" onClick={onButtonContainerClick}>
              Choose Doctor
            </Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link onClick={toggleNotifications} className="position-relative">
              <Bell size={20} />
              {notifications.some((notif) => !notif.isRead) && (
                <span className="notification-badge"></span>
              )}
              {showNotifications && (
                <div className="notification-overlay">
                  {notifications.length > 0 ? (
                    notifications
                      .slice()
                      .reverse()
                      .map((notification, index) => (
                        <div
                          key={index}
                          className={`notification-item ${
                            !notification.isRead ? 'unread' : 'read'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            markAsRead(notification);
                          }}
                        >
                          {/* Display the circle indicator */}
                          <span className="notification-circle">
                            {notification.isRead ? (
                              <span className="circle read"></span>
                            ) : (
                              <span className="circle unread"></span>
                            )}
                          </span>
                          {/* Display the notification message */}
                          <span className="notification-message">{notification.message}</span>
                          {index < notifications.length - 1 && <hr />}
                        </div>
                      ))
                  ) : (
                    <div>No new notifications</div>
                  )}
                </div>
              )}
            </Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            <NavDropdown
              title={
                <div className="d-flex align-items-center justify-content-end ">
                  <div className="ms-2 ">
                    <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {patient.patient_firstName} {patient.patient_lastName}
                    </p>
                    <p
                      className="m-0"
                      style={{
                        fontSize: '12px',
                        color: 'gray',
                        textAlign: 'end',
                      }}
                    >
                      Patient
                    </p>
                  </div>
                  <img
                    src={theImage ? `${ip.address}/${theImage}` : defaultImage}
                    alt="Profile"
                    style={{
                      objectFit: 'cover',
                      height: '40px',
                      width: '40px',
                      borderRadius: '50%',
                    }}
                    className="profile-image ms-3"
                  />
                </div>
              }
              id="basic-nav-dropdown"
              className="pnb-nav-link1"
            >
              <NavDropdown.Item
                as={Link}
                to="/accinfo"
                state={{ pid: patient._id }}
              >
                Account Information
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item className="pnb-nav-link" onClick={logoutUser}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default PatientNavBar;
