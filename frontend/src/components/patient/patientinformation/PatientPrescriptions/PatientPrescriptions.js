import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Container, Button } from 'react-bootstrap';
import './PatientPrescriptions.css';
import { ip } from "../../../../ContentExport";
function PatientPrescriptions() {
    const { pid } = useParams(); 
    const [thePrescriptions, setPrescriptions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
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
                setError('Failed to fetch prescriptions');
                setPrescriptions([]);  // In case of error, set to empty array
            });
    }, [pid]);
    
    // Function to download laboratory results
    const downloadLabResult = async (labResultId) => {
        try {
            // This will trigger the backend to serve the file directly
            const response = await axios.get(`${ip.address}/api/doctor/api/laboratoryResult/download/${labResultId}`, {
                responseType: 'blob'  // Ensure response is returned as a Blob
            });
            window.open(`${ip.address}/api/doctor/api/laboratoryResult/download/${labResultId}`);
            // Create a link to download the file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'lab_result.pdf');  // Set the download filename
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error('Error downloading lab result:', err);
            setError('Failed to download laboratory result');
        }
    };
    
    return (
        <>
        <div style={{ width: '100%', height: '100vh' }}>
            <div>
                <h1>Prescriptions and Laboratory Results</h1>
            </div>

            <Container fluid >
                <div>
                    {thePrescriptions.length > 0 ? (
                        thePrescriptions.reverse().map((appointment, index) => (
                            <div key={index} className="pi-container2" style={{ marginBottom: '40px' }}>
                                <h3>Appointment {index + 1}</h3>
                                <hr/>

                                <p>Physician: {appointment.doctor.dr_firstName} {appointment.doctor.dr_middleInitial}. {appointment.doctor.dr_lastName}</p>
                                <p>Date of Appointment: {new Date(appointment.date).toLocaleDateString()}</p>

                                {/* Prescription Table */}
                                {appointment.prescription && Array.isArray(appointment.prescription.medications) && appointment.status ? (
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

                                {/* Laboratory Results */}
                                {appointment.laboratoryResults && Array.isArray(appointment.laboratoryResults) && appointment.laboratoryResults.length > 0 ? (
    <>
        <h4>Laboratory Results</h4>
        <ul>
            {appointment.laboratoryResults.map((labResult, labIndex) => (
                <li key={labIndex}>
                    <p>Test Date: {new Date(labResult.interpretationDate).toLocaleDateString()}</p>
                    {labResult.file && labResult.file.filename ? (
                        <Button
                            variant="primary"
                            onClick={() => downloadLabResult(labResult._id)}
                        >
                            Download Laboratory Result ({labResult.file.filename})
                        </Button>
                    ) : (
                        <p>No laboratory result file available.</p>
                    )}
                </li>
            ))}
        </ul>
    </>
) : (
    <p>No laboratory results for this appointment.</p>
)}
                            </div>
                        ))
                    ) : (
                        <p>No prescriptions found.</p>
                    )}
                </div>
            </Container>
        </div>
        </>
    );
}

export default PatientPrescriptions;
