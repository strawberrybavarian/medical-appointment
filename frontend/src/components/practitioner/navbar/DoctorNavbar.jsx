// DoctorNavbar.jsx

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import { image, ip } from '../../../ContentExport';
import './Styles.css';
import axios from 'axios';
import io from 'socket.io-client';

function DoctorNavbar({ doctor_image, did }) {
  console.log('Doctor ID:', did);
  const defaultImage = `${ip.address}/images/default-profile.jpg`;
  const [fullName, setFullName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef();

  useEffect(() => {
    if (!did) {
      console.warn('Doctor ID is undefined');
      return;
    }

    // Fetch doctor information and notifications
    axios
      .get(`${ip.address}/api/doctor/one/${did}`)
      .then((res) => {
        const doctor = res.data.doctor;
        const name = `${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`;
        setFullName(name);

        // Notifications are included in the doctor object
        const sortedNotifications = (doctor.notifications || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
      })
      .catch((err) => {
        console.error('Error fetching doctor info:', err);
      });
  }, [did]);

  // Initialize socket.io client
  useEffect(() => {
    if (!did) {
      console.warn('Doctor ID is undefined');
      return;
    }

    socketRef.current = io(ip.address);

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Identify the user to the server
    socketRef.current.emit('identify', { userId: did, userRole: 'Doctor' });

    // Listen for socket events
    socketRef.current.on('appointmentStatusUpdate', (data) => {
      console.log('Received appointmentStatusUpdate event:', data);
      if (data.doctorId === did) {
        const notification = {
          _id: data.notificationId, // Use the notification ID from the server
          message: data.message,
          isRead: false,
          link: data.link,
          type: 'StatusUpdate',
          createdAt: new Date().toISOString(),
        };
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);

        showBrowserNotification(data.message);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.io.on('reconnect', () => {
      console.log('Socket reconnected');
      socketRef.current.emit('identify', { userId: did, userRole: 'Doctor' });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [did]);

  // Request browser notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (notification) => {
    try {
      if (notification.link) {
        navigate(notification.link, { state: { did } });
      }

      if (!notification._id) {
        console.error('Notification ID is undefined');
        return;
      }

      await axios.put(`${ip.address}/api/notifications/${notification._id}/read`);

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

  // Calculate unread notifications count and set max to 9+
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  const onLogout = () => {
    // Implement logout logic here
    // For example, remove tokens, clear local storage, etc.
    navigate('/login');
  };

  return (
    <div className="landing-page">
      <div>
        <Navbar bg="" expand="lg" className="dn-navbar">
          <Container fluid style={{ padding: '0 4rem 0 4rem' }}>
            <Link to={`/doctor/home/${did}`}>
              <img className="molino-logo" src={image.logo || defaultImage} alt="Logo" />
            </Link>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <Nav>
                <Nav.Link onClick={toggleNotifications} className="position-relative">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notification-badge">{displayCount}</span>}
                  {showNotifications && (
                    <div className="notification-overlay">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={notification._id}
                            className={`notification-item ${
                              !notification.isRead ? 'unread' : 'read'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              markAsRead(notification);
                            }}
                          >
                            <span className="notification-circle">
                              {notification.isRead ? (
                                <span className="circle read"></span>
                              ) : (
                                <span className="circle unread"></span>
                              )}
                            </span>
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

              <Nav className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-end">
                  <div className="ms-2">
                    <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {fullName}
                    </p>
                    <p
                      className="m-0"
                      style={{ fontSize: '12px', color: 'gray', textAlign: 'end' }}
                    >
                      Doctor
                    </p>
                  </div>
                  <img
                    src={doctor_image ? `${ip.address}/${doctor_image}` : defaultImage}
                    alt="Profile"
                    className="profile-image ms-3"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    </div>
  );
}

export default DoctorNavbar;
