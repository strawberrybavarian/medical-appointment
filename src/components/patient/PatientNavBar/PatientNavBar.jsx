import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell, ChevronDown } from 'react-bootstrap-icons';
import axios from 'axios';
import './PatientNavBar.css';

import { image, ip } from '../../../ContentExport';
function PatientNavBar() {
    const navigate = useNavigate();
    const { pid } = useParams();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [itemsToShow, setItemsToShow] = useState(3);
    const [patientInfo, setPatientInfo] = useState(null); // To store patient information

    const defaultImage = "http://localhost:8000/images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

    useEffect(() => {
        const fetchPatientInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`);
                setNotifications(response.data.thePatient.notifications);
                setPatientInfo(response.data.thePatient); // Store patient info
            } catch (error) {
                console.error('Error fetching notifications', error);
            }
        };

        fetchPatientInfo();
    }, [pid]);

    const [fullName, setFullName] = useState('');

    useEffect(() => {
    const fetchPatient = async () => {
        try {
        const response = await axios.get(`${ip.address}/patient/api/onepatient/${pid}`);
        
        const fullName = `${response.data.thePatient.patient_firstName} ${response.data.thePatient.patient_lastName}`;
        setFullName(fullName);
    
        } catch (error) {
        console.error('Error fetching patient data:', error);
        }
    };

    fetchPatient();
    }, [pid]);

    const onClickHomepage = () => {
        navigate(`/homepage/${pid}`);
    };

    const onButtonContainerClick = () => {
        navigate(`/choosedoctor/${pid}`);
    };

    const onButtonContainer1Click = () => {
        navigate("/");
    };

    const MyAppointment = () => {
        navigate(`/myappointment/${pid}`);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const showMore = () => {
        setItemsToShow(notifications.length);
    };

    const showLess = () => {
        setItemsToShow(3);
    };

    return (
        <>
            <Navbar expand="md" className="pnb-navbar">
                <Container>
                    <Link to={`/homepage/${pid}`}>
                        <img className="molino-logo" src={image.logo} alt="Logo" />
                    </Link>
                    <div className='msn-container'>
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
                                        {notifications.length > 0 ? (
                                            [...notifications].reverse().slice(0, itemsToShow).map((notification, index) => (
                                                <div key={index} className="notification-item">
                                                    {notification.message}
                                                    {index < itemsToShow - 1 && index < notifications.length - 1 && <hr />}
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
                                      
                                                <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>{fullName}</p>
                                                <p  className="m-0" style={{ fontSize: '12px', color: 'gray', textAlign: 'end' }}>Patient</p>
                                           
                                            
                                        </div>
                                        <img
                                            src={patientInfo && patientInfo.image ? `http://localhost:8000/${patientInfo.image}` : defaultImage}
                                            alt="Profile"
                                            className="profile-image ms-3"
                                        />
                                    </div>
                                }
                                id="basic-nav-dropdown"
                                className="pnb-nav-link1"
                            >
                                <NavDropdown.Item as={Link} to={`/accinfo/${pid}`}>Account Information</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item className="pnb-nav-link" onClick={onButtonContainer1Click}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default PatientNavBar;
