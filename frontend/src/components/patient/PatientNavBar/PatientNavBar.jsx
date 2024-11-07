// PatientNavBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import './PatientNavBar.css';
import { usePatient } from '../PatientContext';
import { image, ip } from '../../../ContentExport';
import axios from 'axios';

function PatientNavBar({ pid }) {
  const navigate = useNavigate();
  const { patient, setPatient } = usePatient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [theImage, setImage] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const defaultImage = `${ip.address}/images/014ef2f860e8e56b27d4a3267e0a193a.jpg`;

  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
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
    navigate("/medapp/login");
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

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${ip.address}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // If you use token-based auth
        }
      });
      // Update the notification state
      setNotifications(notifications.map(notif => {
        if (notif._id === notificationId) {
          return { ...notif, isRead: true };
        }
        return notif;
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Navbar fluid expand="md" className="nav-bar-no-color navbar-fixed-top fixed-top px-5 py-0" style={{ zIndex: '2' }}>
      <Container fluid>
        <Link to={{ pathname: `/homepage`, state: { pid: patient._id } }}>
          <img className="molino-logo" src={image.logo || defaultImage} alt="Logo" />
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link className="pnb-nav-link" onClick={onClickHomepage}>Home</Nav.Link>
            <Nav.Link className="pnb-nav-link" onClick={MyAppointment}>My Appointments</Nav.Link>
            <Nav.Link className="pnb-nav-link" onClick={onButtonContainerClick}>Choose Doctor</Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link onClick={toggleNotifications} className="position-relative">
              <Bell size={20} />
              {notifications.some(notif => !notif.isRead) && (
                <span className="notification-badge"></span>
              )}
              {showNotifications && (
                <div className="notification-overlay">
                  {notifications.length > 0 ? (
                    notifications.slice().reverse().map((notification, index) => (
                      <div
                        key={index}
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          markAsRead(notification._id);
                          // Navigate or perform any action upon clicking the notification
                        }}
                      >
                        {notification.message}
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
                    <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>{patient.patient_firstName} {patient.patient_lastName}</p>
                    <p className="m-0" style={{ fontSize: '12px', color: 'gray', textAlign: 'end' }}>Patient</p>
                  </div>
                  <img
                    src={theImage ? `${ip.address}/${theImage}` : defaultImage}
                    alt="Profile"
                    style={{ objectFit: 'cover', height: '40px', width: '40px', borderRadius: '50%' }}
                    className="profile-image ms-3"
                  />
                </div>
              }
              id="basic-nav-dropdown"
              className="pnb-nav-link1"
            >
              <NavDropdown.Item as={Link} to="/accinfo" state={{ pid: patient._id }}>Account Information</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item className="pnb-nav-link" onClick={logoutUser}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default PatientNavBar;
