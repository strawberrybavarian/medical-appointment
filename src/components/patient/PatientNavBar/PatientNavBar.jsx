import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Bell, ChevronDown } from 'react-bootstrap-icons';
import axios from 'axios';
import './PatientNavBar.css';
import {image} from '../../../ContentExport'

function PatientNavBar() {
    const navigate = useNavigate();
    const { pid } = useParams();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [itemsToShow, setItemsToShow] = useState(3);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`);
                setNotifications(response.data.thePatient.notifications);
                console.log(response.data.thePatient.notifications);
            } catch (error) {
                console.error('Error fetching notifications', error);
            }
        };

        fetchNotifications();
    }, [pid]);

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
            <Navbar expand="lg" className="pnb-navbar">
                <Container>
                        <Link to={`/homepage/${pid}`}>
                            <img  className="molino-logo" src={image.logo} alt="Logo" />
                        </Link>
                            <div className='msn-container'>    
                                <h6>Molino Polyclinic</h6>
                            </div>
                     

                       
                  
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                        <Nav>
                            <Nav.Link className="pnb-nav-link" onClick={MyAppointment}>My Appointments</Nav.Link>
                            <Nav.Link className="pnb-nav-link" onClick={onButtonContainerClick}>Choose Doctor</Nav.Link>
                        </Nav>

                        <Nav>
                            <NavDropdown title={<span>Account <ChevronDown /></span>} id="basic-nav-dropdown" className="pnb-nav-link1">
                                <NavDropdown.Item as={Link} to={`/accinfo/${pid}`}>Account Information</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item className="pnb-nav-link" onClick={onButtonContainer1Click}>Logout</NavDropdown.Item>
                            </NavDropdown>
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

                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default PatientNavBar;
