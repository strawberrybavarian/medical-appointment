import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import { image, ip } from '../../../../ContentExport';
import './Styles.css';
import axios from 'axios';
import io from 'socket.io-client';
import LogoutModal from '../../../practitioner/sidebar/LogoutModal';
import { useUser } from '../../../UserContext';
function MedSecNavbar()  {
  const defaultImage = `${ip.address}/images/014ef2f860e8e56b27d4a3267e0a193a.jpg`;
  const navigate = useNavigate();
  const { user } = useUser();
  const msid = user._id;
  const [medSecData, setMedSecData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Socket reference
  const socketRef = useRef();

  // Fetch MedSec data and notifications
  useEffect(() => {
    axios.get(`${ip.address}/api/medicalsecretary/api/findone/${msid}`)
      .then((res) => {
        const medsec = res.data.theMedSec;
        setMedSecData(medsec);
        setRoles(medsec.role);
        
        const fullName = medsec.ms_firstName + ' ' + medsec.ms_lastName;
        setName(fullName);
        // console.log(medsec);

        // If the medsec data includes notifications, load them
        if (medsec.notifications && Array.isArray(medsec.notifications)) {
          // Sort notifications by createdAt desc if createdAt exists
          const sortedNotifications = medsec.notifications.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setNotifications(sortedNotifications);
        }
      })
      .catch((err) => {
        console.error('Error fetching Medical Secretary data:', err);
        setError('Failed to fetch data');
      });
  }, [msid]);

  // Initialize socket and handle incoming notifications
  useEffect(() => {
    // Request browser notification permission if needed
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    socketRef.current = io(ip.address);
    socketRef.current.on('connect', () => {
      // console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    if (msid) {
      socketRef.current.emit('identify', { userId: msid, userRole: 'Medical Secretary' });
    } else {
      console.warn('Medical Secretary ID is undefined');
    }

    // Listen for general notifications
    socketRef.current.on('newGeneralNotification', (data) => {
      // data: { message: '...', notificationId: '...', link: '...' }
      const notification = {
        _id: data.notificationId,
        message: data.message,
        isRead: false,
        link: data.link || '',
        createdAt: new Date().toISOString(),
      };

      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      showBrowserNotification(data.message);
    });

    socketRef.current.on('disconnect', () => {
      // console.log('Socket disconnected');
    });

    socketRef.current.io.on('reconnect', () => {
      // console.log('Socket reconnected');
      if (msid) {
        socketRef.current.emit('identify', { userId: msid, userRole: 'Medical Secretary' });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [msid]);

  const showBrowserNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Notification', {
        body: message,
        icon: image.logo || defaultImage,
      });
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (notification) => {
    try {
      if (!notification._id) {
        console.error('Notification ID is undefined');
        return;
      }

      if (notification.link) {
        navigate(notification.link, { state: { userId: msid, userName: name, role: roles } });
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

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  const onNavigateAppoinments = () => {
    navigate(`/medsec/appointments`, { state: { userId: msid, userName: name, role: roles } });
  };
  const onNavigatePatient = () => {
    navigate(`/medsec/patient`, { state: { userId: msid, userName: name, role: roles } });
  };
  const onNavigateDoctors = () => {
    navigate(`/medsec/doctors`, { state: { userId: msid, userName: name, role: roles } });
  };
  const onNavigateDashboard = () => {
    navigate(`/medsec/dashboard`, { state: { userId: msid, userName: name, role: roles } });
  };
  const onNavigateAccountInfo = () => {
    navigate(`/medsec/account`, { state: { userId: msid, userName: name, role: roles } });
  };
  
  // New logout functions
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = async () => {
    try {
      await axios.post(`${ip.address}/api/logout`, {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error('Error logging out:', error);
      // Fallback if logout API fails
      navigate("/");
    }
  };

  return (
    <>
      <div className="landing-page">
        <div className="navbar-3">
          <Navbar bg="light" expand="lg" className="nav-bar-no-color navbar-fixed-top fixed-top px-5 py-0">
            <Container fluid>
              <img className="molino-logo" src={image.logo} alt="Logo" />
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                <Nav>
                  <Nav.Link className="pnb-nav-link" onClick={onNavigateDashboard}>Dashboard </Nav.Link>
                  <Nav.Link className="pnb-nav-link" onClick={onNavigateAppoinments}>Appointments </Nav.Link>
                  <Nav.Link className="pnb-nav-link" onClick={onNavigateDoctors}>Manage Doctors </Nav.Link>
                  <Nav.Link className="pnb-nav-link" onClick={onNavigatePatient}>Patients </Nav.Link>
                </Nav>
                <Nav>
                  <Nav.Link onClick={toggleNotifications} className="position-relative">
                    <Bell size={20} className={unreadCount > 0 ? 'sway' : ''} />
                    {unreadCount > 0 && (
                      <span className="notification-dot"></span>
                    )}
                    {showNotifications && (
                      <div className="notification-overlay">
                        {notifications.length > 0 ? (
                          notifications.map((notification, index) => (
                            <div
                              key={notification._id}
                              className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
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
                <Nav>
                  <NavDropdown
                    title={
                      <div className="d-flex align-items-center justify-content-end ">
                        <div className="ms-2 ">
                          <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>{name}</p>
                          <p className="m-0" style={{ fontSize: '12px', color: 'gray', textAlign: 'end' }}>Medical Secretary</p>
                        </div>
                        <img
                          src={defaultImage}
                          alt="Profile"
                          style={{ objectFit: 'cover' }}
                          className="profile-image ms-3"
                        />
                      </div>
                    }
                    id="basic-nav-dropdown"
                    className="pnb-nav-link1"
                  >
                    <NavDropdown.Item className="pnb-nav-link" onClick={onNavigateAccountInfo}>Account</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item className="pnb-nav-link" onClick={handleLogout}>Logout</NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        show={showLogoutModal} 
        onCancel={cancelLogout} 
        onConfirm={confirmLogout} 
      />
    </>
  );
}

export default MedSecNavbar;