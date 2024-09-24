import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import './PatientNavBar.css';
import { usePatient } from '../PatientContext';
import { image } from '../../../ContentExport';
function PatientNavBar() {
    const navigate = useNavigate();
    const { patient, setPatient } = usePatient(); // Get patient data from the context
    const [showNotifications, setShowNotifications] = useState(false);
    const [itemsToShow, setItemsToShow] = useState(3);

    const inactivityLimit = 1000000; // 10 seconds
    let timeoutId = null; // To store the timeout ID

    const defaultImage = "http://localhost:8000/images/014ef2f860e8e56b27d4a3267e0a193a.jpg";


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
        <Navbar expand="md" className="pnb-navbar">
            <Container>
                <Link to={{ pathname: `/homepage`, state: { pid: patient._id } }}>
                    <img className="molino-logo" src={image.logo} alt="Logo" />
                </Link>
                <div className="msn-container">
                    <h6>Molino Polyclinic</h6>
                </div>

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
                                        src={patient.image || defaultImage}
                                        alt="Profile"
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
