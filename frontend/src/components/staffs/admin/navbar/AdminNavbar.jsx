import React from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import {  ChevronDown } from 'react-bootstrap-icons';

import { image, ip } from '../../../../ContentExport';
import './AdminNavbar.css'

function AdminNavbar({userId, userName, role}) {
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const navigate = useNavigate();

  return (
    <>
    
        <div className="landing-page">
            <div className="navbar-3">
                <Navbar bg="light" expand="lg" className="an-navbar">
                <Container>
                           
                            <img className="molino-logo" src={image.logo} alt="Logo" />
                            <div className='msn-container'>    
                          
                            </div>
                           
         
           
                            
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                        <Nav>
                            {/* <Nav.Link className="pnb-nav-link" onClick={onNavigateAppoinments}>Appointments </Nav.Link>
                            <Nav.Link className="pnb-nav-link" onClick={onNavigateCreatePatient}>Create Appointment </Nav.Link> */}
                            
                        </Nav>

                        <Nav>
                                <div className="d-flex align-items-center justify-content-end ">
                                        
                                        <div className="ms-2 ">
                                      
                                                <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>{userName}</p>
                                                <p  className="m-0" style={{ fontSize: '12px', color: 'gray', textAlign: 'end' }}>Admin</p>
                                           
                                            
                                        </div>
                                        <img
                                            src={  `${ip.address}/${defaultImage}`}
                                            alt="Profile"
                                            className="profile-image ms-3"
                                            style={{objectFit: 'cover'}}
                                        />
                                    </div>
                        </Nav>
                        
                    </Navbar.Collapse>
                </Container>
                </Navbar>
            </div>
        </div>

    </>
  )
}

export default AdminNavbar;