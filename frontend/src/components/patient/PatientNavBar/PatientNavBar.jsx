import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import './PatientNavBar.css';
import { usePatient } from '../PatientContext';
import { image, ip } from '../../../ContentExport';
import axios from 'axios';
function PatientNavBar({pid}) {
    const navigate = useNavigate();
    const { patient, setPatient } = usePatient(); // Get patient data from the context
    const [showNotifications, setShowNotifications] = useState(false);
    const [itemsToShow, setItemsToShow] = useState(3);
    const [theImage, setImage] = useState(null);
    const inactivityLimit = 1000000; // 10 seconds
    let timeoutId = null; // To store the timeout ID

    const defaultImage = `${ip.address}/images/014ef2f860e8e56b27d4a3267e0a193a.jpg`;
    useEffect(() => {
        axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
          .then((res) => {
            const patientData = res.data.thePatient;

            setImage(patientData.patient_image || defaultImage);  // Set patient image
          })
          .catch((err) => {
            console.log(err);
          });
      }, [pid]);
    
    const logoutUser = () => {
        setPatient(null);  // Clear the patient context (session)
        localStorage.removeItem('patient');  // Clear the localStorage to remove persistent session data
        navigate("/medapp/login");  // Redirect the user to the login page
    };
    

    // Start inactivity timer
    const startInactivityTimer = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            logoutUser(); // Log the user out after inactivity
        }, inactivityLimit);
    };

    // Reset inactivity timer on user activity
    const resetInactivityTimer = () => {
        startInactivityTimer();
    };

    useEffect(() => {
        // Set up event listeners for activity detection
        window.addEventListener("mousemove", resetInactivityTimer);
        window.addEventListener("keypress", resetInactivityTimer);

        // Start the initial inactivity timer
        startInactivityTimer();

        // Cleanup event listeners on component unmount
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("mousemove", resetInactivityTimer);
            window.removeEventListener("keypress", resetInactivityTimer);
        };
    }, []);

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

    const showMore = () => {
        setItemsToShow(patient.notifications.length);
    };

    const showLess = () => {
        setItemsToShow(3);
    };

    return (
        <Navbar fluid expand="md" className="pnb-navbar">
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
                            {showNotifications && (
                                <div className="notification-overlay">
                                    {patient.notifications.length > 0 ? (
                                        [...patient.notifications].reverse().slice(0, itemsToShow).map((notification, index) => (
                                            <div key={index} className="notification-item">
                                                {notification.message}
                                                {index < itemsToShow - 1 && index < patient.notifications.length - 1 && <hr />}
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
                        {/* Profile section with image and two-paragraph text */}
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
