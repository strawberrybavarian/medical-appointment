import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import { image, ip } from '../../../../ContentExport';
import './AdminNavbar.css';
import axios from 'axios';
import io from 'socket.io-client';

function AdminNavbar({ userId, userName, role }) {
  const defaultImage = "images/Admin-Icon.jpg";
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    // Request browser notification permission if needed
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Initialize socket
    socketRef.current = io(ip.address);
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    if (userId) {
      socketRef.current.emit('identify', { userId, userRole: 'Admin' });
    } else {
      console.warn('Admin ID is undefined');
    }

    socketRef.current.on('newGeneralNotification', (data) => {
      const notification = {
        _id: data.notificationId,
        message: data.message,
        isRead: false,
        link: data.link || '',
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      showBrowserNotification(data.message);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.io.on('reconnect', () => {
      console.log('Socket reconnected');
      if (userId) {
        socketRef.current.emit('identify', { userId, userRole: 'Admin' });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      console.warn('Admin ID is undefined');
      return;
    }

    // Fetch existing notifications for Admin
    // Adjust the endpoint as per your API definition
    axios
      .get(`${ip.address}/api/admin/${userId}`)
      .then((res) => {
        const adminData = res.data.theAdmin;
        if (adminData.notifications && Array.isArray(adminData.notifications)) {
          const sortedNotifications = adminData.notifications.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setNotifications(sortedNotifications);
        }
      })
      .catch((err) => {
        console.log('Error fetching Admin data:', err);
      });
  }, [userId]);

  const showBrowserNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Notification', {
        body: message,
        icon: image.logo || `${ip.address}/${defaultImage}`,
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
        navigate(notification.link, { state: { userId, userName, role } });
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

  return (
    <>
      <div className="landing-page">
        <div className="navbar-3">
          <Navbar bg="light" expand="lg" className="an-navbar">
            <Container>
              <img className="molino-logo" src={image.logo} alt="Logo" />
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                <Nav className="me-auto">
                  {/* Add any Admin-specific links if needed */}
                </Nav>

                <Nav className="align-items-center">

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

                  <div className="d-flex align-items-center justify-content-end ms-3">
                    <div className="ms-2 ">
                      <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>{userName}</p>
                      <p className="m-0" style={{ fontSize: '12px', color: 'gray', textAlign: 'end' }}>Admin</p>
                    </div>
                    <img
                      src={`${ip.address}/${defaultImage}`}
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
    </>
  );
}

export default AdminNavbar;
