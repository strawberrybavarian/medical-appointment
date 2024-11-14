import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  // Initialize socket.io client
  useEffect(() => {
    socketRef.current = io(ip.address);

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    if (pid) {
      socketRef.current.emit('identify', { userId: pid, userRole: 'Patient' });
    } else {
      console.warn('Patient ID is undefined');
    }

    socketRef.current.on('newNews', (data) => {
      const notification = {
        _id: data.notificationId, // Use the notification ID from the server
        message: data.message,
        isRead: false,
        link: data.link,
        type: 'News',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      showBrowserNotification(data.message);
    });

    socketRef.current.on('appointmentStatusUpdate', (data) => {
      if (data.patientId === pid) {
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
      if (pid) {
        socketRef.current.emit('identify', { userId: pid, userRole: 'Patient' });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [pid]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!pid) {
      console.warn('Patient ID is undefined');
      return;
    }

    axios
      .get(`${ip.address}/api/patient/api/onepatient/${pid}`)
      .then((res) => {
        const patientData = res.data.thePatient;
        setImage(patientData.patient_image || defaultImage);
        const sortedNotifications = (patientData.notifications || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
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
      if (notification.link) {
        navigate(notification.link, { state: { pid } }); // Pass pid in state
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
            <Nav.Link
              className={`pnb-nav-link ${location.pathname === '/homepage' ? 'active' : ''}`}
              onClick={onClickHomepage}
            >
              Home
            </Nav.Link>
            <Nav.Link
              className={`pnb-nav-link ${location.pathname === '/myappointment' ? 'active' : ''}`}
              onClick={MyAppointment}
            >
              My Appointments
            </Nav.Link>
            <Nav.Link
              className={`pnb-nav-link ${location.pathname === '/choosedoctor' ? 'active' : ''}`}
              onClick={onButtonContainerClick}
            >
              Choose Doctor
            </Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link onClick={toggleNotifications} className="position-relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{displayCount}</span>
              )}
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
