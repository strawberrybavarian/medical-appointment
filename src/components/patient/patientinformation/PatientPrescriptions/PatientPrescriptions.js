import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from 'react-bootstrap';

import './PatientPrescriptions.css';

function PatientPrescriptions() {
    const { pid } = useParams(); 
    const [thePrescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                console.log(res.data);  // Log the entire response to understand its structure
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
                    setPrescriptions(res.data.thePatient.patient_appointments);
                    console.log(res.data.thePatient);
                } else {
                    setPrescriptions([]);  // If data is not as expected, set to empty array
                }
            })
            .catch((err) => {
                console.log(err);
                setPrescriptions([]);  // In case of error, set to empty array
            });
    }, [pid]);

    return (
        <>
        <div style={{ width: '100%', height: '100vh' }}>
         {/* <Scrollbars style={{ width: '100%', height: '100%' }} className="pp-scrollbar"> */}
              
           
            <div>
                
                <h1>Prescriptions</h1>
            </div>

            <div className="pi-container">
                <div>
                {thePrescriptions.length > 0 ? (
                    thePrescriptions.map((appointment, index) => (
                        <div key={index} className="pi-container2" style={{marginBottom: '40px'}}>
                            
                            <h3>Appointment {index + 1}</h3>

                                <p> Physician: {appointment.doctor.dr_firstName} {appointment.doctor.dr_middleInitial}. {appointment.doctor.dr_lastName} </p>
                                <p> Date of Appointment: {new Date(appointment.date).toLocaleDateString()}</p>
                            <div>
                            {appointment.prescription && Array.isArray(appointment.prescription.medications) && appointment.status === 'Completed' ? (
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointment.prescription.medications.map((medication, medIndex) => (
                                            <tr key={medIndex}>
                                                <td>{medication.name}</td>
                                                <td>{medication.type}</td>
                                                <td>{medication.instruction}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p>No medications found for this appointment.</p>
                            )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No prescriptions found.</p>
                )}
                </div>
            </div>
                <div style={{marginBottom: '12vh'}}>

                </div>
            {/* </Scrollbars> */}
            </div>
        </>
    );
}

export default PatientPrescriptions;
