import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Nav, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import PatientHistory from '../Patient History/PatientHistory';
import Prescription from '../Prescription/Prescription'; // Import the new Prescription component
import Immunization from '../Immunization/Immunization';
const PatientMedicalRecord = () => {
    const { pid } = useParams();
    const [thePrescriptions, setPrescriptions] = useState([]);
    const [theHistory, setHistory] = useState([]);
    const [theImmunization, setImmunization] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('findings');
    
    const handleSelect = (selectedKey) => {
        // Update the active tab based on the selected event key
        setActiveTab(selectedKey);
    };

    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                console.log(res.data);  // Log the entire response to understand its structure
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
                    setPrescriptions(res.data.thePatient.patient_appointments);
                    setHistory(res.data.thePatient.patient_findings);
                    setImmunization(res.data.thePatient.immunizations);
                } else {
                    setPrescriptions([]);
                    setHistory([]);  // If data is not as expected, set to empty array
                }
            })
            .catch((err) => {
                console.log(err);
                setError('Failed to fetch prescriptions');
                setPrescriptions([]);  // In case of error, set to empty array
            });
    }, [pid]);

    return (
        <div>
            <div className='pnb-component'>
                <Container className='d-flex p-0'>
                    <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={handleSelect}>
                        <Nav.Item>
                            <Nav.Link eventKey="findings">Patient History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="prescription">My Prescriptions</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="immunization">My Immunizations</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="laboratory">Laboratory Results</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Container>

                {/* Render components based on the active tab */}
                <Container className={`pnb-content ${activeTab === 'findings' ? 'findings-tab' : 'other-tabs'}`}>
                    {activeTab === 'findings' && <PatientHistory patientHistory={theHistory} />}
                    {activeTab === 'prescription' && <Prescription prescriptions={thePrescriptions} />} 
                    {activeTab === 'immunization' && <Immunization immunizations={theImmunization} />}
                </Container>
            </div>
        </div>
    );
};

export default PatientMedicalRecord;
