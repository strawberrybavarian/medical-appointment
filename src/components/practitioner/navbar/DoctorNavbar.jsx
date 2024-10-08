import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import {  ChevronDown } from 'react-bootstrap-icons';
import { image, ip } from '../../../ContentExport';
import './Styles.css'
import axios from 'axios';
function DoctorNavbar({doctor_image, did}) {
    console.log(did);
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const [fullName, setFullName] = useState("");   
    const navigate = useNavigate();
    const {msid} = useParams();

    useEffect(()=> {
        axios.get(`${ip.address}/doctor/one/${did}`)
        .then((res) => {
            const name = res.data.doctor.dr_firstName + " " + res.data.doctor.dr_middleInitial + ". " + res.data.doctor.dr_lastName;
            setFullName(name);
        }).catch((err) => {
            console.log(err);
        })
    }, [])


    const onNavigateAppoinments = () => {
        navigate(`/medsec/${msid}`)
    }
    const onNavigateCreatePatient = () => {
        navigate(`/medsec/createpatient/${msid}`)
    }
    
    const onButtonContainer1Click = () => {
        navigate("/");
    };
  return (
    <>
    
        <div className="landing-page">
            <div >
                <Navbar bg="" expand="lg" className="dn-navbar">
                <Container fluid>
                           
                            <img className="molino-logo" src={image.logo} alt="Logo" />
                            <div className='msn-container'>    
                                <h6>Molino Polyclinic</h6>
                            </div>
                           
         
           
                            
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                        <Nav>
                            {/* <Nav.Link className="pnb-nav-link" onClick={onNavigateAppoinments}>Appointments </Nav.Link>
                            <Nav.Link className="pnb-nav-link" onClick={onNavigateCreatePatient}>Create Appointment </Nav.Link> */}
                            
                        </Nav>



                        <Nav className="align-items-center">
                            {/* Profile section with image and two-paragraph text */}
                            <NavDropdown
                                title={
                                    <div className="d-flex align-items-center justify-content-end ">
                                        
                                        <div className="ms-2 ">
                                      
                                                <p className="m-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>{fullName}</p>
                                                <p  className="m-0" style={{ fontSize: '12px', color: 'gray', textAlign: 'end' }}>Doctor</p>
                                           
                                            
                                        </div>
                                        <img
                                            src={ doctor_image ? `http://localhost:8000/${doctor_image}` : defaultImage}
                                            alt="Profile"
                                            className="profile-image ms-3"
                                            style={{objectFit: 'cover'}}
                                        />
                                    </div>
                                }
                                id="basic-nav-dropdown"
                                className="pnb-nav-link1"
                            >   
                            
                            <NavDropdown.Item as={Link} to="/account" state={{did: did}}>Account</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item className="pnb-nav-link" onClick={onButtonContainer1Click}>Logout</NavDropdown.Item>
                                
                                   
                                
                            </NavDropdown>
                        </Nav>
                        
                    </Navbar.Collapse>
                </Container>
                </Navbar>
            </div>
        </div>

    </>
  )
}

export default DoctorNavbar;