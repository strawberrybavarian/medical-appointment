import React, { useState, useEffect } from 'react';
import { useNavigate, useParams,  } from "react-router-dom";
import { Container, Navbar, Nav,  } from 'react-bootstrap';

import axios from 'axios';
import Prescription from '../prescription/Prescription';
import PatientFindings from '../findings/PatientFindings';
import './PractitionerNavBarStyles.css'

function PractitionerNavBar() {
    const navigate = useNavigate();
    const { pid, did, apid } = useParams();
    console.log(pid,did, apid);

    const [activeTab, setActiveTab] = useState("findings");
    useEffect(() => {

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`);
    
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching notifications', error);
            }
        };

        fetchNotifications();
    }, [pid]);

    const onButtonContainerClick = () => {
        navigate(`/choosedoctor/${pid}`);
    };

    return (
        <>  <div className='pnb-component'>
            <Navbar expand="lg" className="pnb-navbar">
                <Container>
                    
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                        <Nav>
                            <Nav.Link className="pnb-nav-link" onClick={()=> setActiveTab("findings")}>Patient Findings</Nav.Link>
                            <Nav.Link className="pnb-nav-link" onClick={()=> setActiveTab("prescription")}>Create Prescription</Nav.Link>
                            <Nav.Link className="pnb-nav-link" onClick={onButtonContainerClick}>Radiology Result</Nav.Link>
                            <Nav.Link className="pnb-nav-link" onClick={onButtonContainerClick}>Radiology Result</Nav.Link>
                        </Nav>

                
            
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            
                {activeTab === 'findings' && <PatientFindings patientId={pid} doctorId={did} appointmentId={apid}/>}
                {activeTab === 'prescription' && <Prescription patientId={pid} doctorId={did} appointmentId={apid}/>}
         
            </div>
            
            
        </>
    );
}

export default PractitionerNavBar;
