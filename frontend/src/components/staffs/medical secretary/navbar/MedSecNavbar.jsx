import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { ChevronDown, Bell } from 'react-bootstrap-icons';
import {image, ip} from '../../../../ContentExport'
import  './Styles.css'
import axios from 'axios';
function MedSecNavbar({msid}) {
    
    const defaultImage = `${ip.address}/images/014ef2f860e8e56b27d4a3267e0a193a.jpg`;

    const navigate = useNavigate();
    

    const [medSecData, setMedSecData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${ip.address}/api/medicalsecretary/api/findone/${msid}`)
        .then((res) => {
            const medsec = res.data.theMedSec;

            setMedSecData(medsec); 
            setRoles(medsec.role);
            
            const fullName = medsec.ms_firstName + ' ' + medsec.ms_lastName;
            setName(fullName);
        })
        .catch((err) => {
            console.error('Error fetching Medical Secretary data:', err);
            setError('Failed to fetch data');
        });
    }, [msid]);

    console.log(name);
    

    const onNavigateAppoinments = () => {
        navigate(`/medsec/appointments`, {state: {userId: msid, userName: name, role: roles}})
    }
    const onNavigateCreatePatient = () => {
        navigate(`/medsec/createpatient/${msid}`)
    }



    const onNavigateDoctors = () => {
        navigate(`/medsec/doctors`, {state: {userId: msid, userName: name, role: roles}})
    }

    const onNavigateDashboard = () => {
        navigate(`/medsec/dashboard`, {state: {userId: msid, userName: name, role: roles}})
    }

    const onNavigateAccountInfo = () => {
        navigate(`/medsec/account`, {state: {userId: msid, userName: name, role: roles}})
    }
    
    const logOut = () => {
        navigate("/");
    };
  return (
    <>
    
        <div className="landing-page">
            <div className="navbar-3">
                <Navbar bg="light" expand="lg" className="pnb-navbar">
                <Container fluid>
                           
                            <img className="molino-logo" src={image.logo} alt="Logo" />
                            <div className='msn-container'>    
                                <h6>Molino Polyclinic</h6>
                            </div>
                           
         
           
                            
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                        <Nav>
                            <Nav.Link className="pnb-nav-link" onClick={onNavigateDashboard}>Dashboard </Nav.Link>

                            <Nav.Link className="pnb-nav-link" onClick={onNavigateAppoinments}>Appointments </Nav.Link>
                    
                          
                            <Nav.Link className="pnb-nav-link" onClick={onNavigateDoctors}>Manage Doctors </Nav.Link>
                            
                            
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
                                {/* <NavDropdown.Item as={Link} to="/accinfo" state={{ pid: patient._id }}>Account Information</NavDropdown.Item> */}
                               
                                <NavDropdown.Item className="pnb-nav-link" onClick={onNavigateAccountInfo}>Account</NavDropdown.Item>
                          
                                <NavDropdown.Item className="pnb-nav-link" onClick={logOut}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>

                        <Nav>
                        <Nav>
                            <Nav.Link  className="position-relative">
                                <Bell size={20} />
                            </Nav.Link>
                        </Nav>
                        </Nav>
                        
                    </Navbar.Collapse>
                </Container>
                </Navbar>
            </div>
        </div>

    </>
  )
}

export default MedSecNavbar