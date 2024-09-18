import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Container, Nav } from 'react-bootstrap';

import axios from 'axios';
import Prescription from '../prescription/Prescription';
import PatientFindings from '../findings/PatientFindings';
import './PractitionerNavBarStyles.css';
import Immunization from '../immunization/Immunization';
import LaboratoryResults from '../laboratory/LaboratoryResults';

function PractitionerNavBar() {
    const navigate = useNavigate();
    const { pid, did, apid } = useParams();

    // Default active tab
    const [activeTab, setActiveTab] = useState("findings");

    // Fetch patient data when the component loads
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                await axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`);
            } catch (error) {
                console.error('Error fetching patient data', error);
            }
        };

        fetchPatientData();
    }, [pid]);

    const handleSelect = (selectedKey) => {
        // Update the active tab based on the selected event key
        setActiveTab(selectedKey);
    };

    return (
        <>
            <div className='pnb-component'>
                {/* Use Nav to create tab-like navigation */}
                <Container className='d-flex p-0'>
                    <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={handleSelect}>
                        <Nav.Item>
                            <Nav.Link eventKey="findings">Patient Findings</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="prescription">Create Prescription</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="immunization">Immunization</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="laboratory">Laboratory Results</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Container>

                {/* Render components based on the active tab */}
                <Container className={`pnb-content ${activeTab === 'findings' ? 'findings-tab' : 'other-tabs'}`}>
                    {activeTab === 'findings' && <PatientFindings patientId={pid} doctorId={did} appointmentId={apid} />}
                    {activeTab === 'prescription' && <Prescription patientId={pid} doctorId={did} appointmentId={apid} />}
                    {activeTab === 'immunization' && <Immunization patientId={pid} doctorId={did} appointmentId={apid} />}
                    {activeTab === 'laboratory' && <LaboratoryResults patientId={pid} doctorId={did} appointmentId={apid} />}
                </Container>
            </div>
        </>
    );
}

export default PractitionerNavBar;
