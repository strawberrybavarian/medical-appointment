import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { ip } from "../../../ContentExport";
import { usePatient } from "../PatientContext";

function ChooseDoctorServices() {
    const [theDoctors, setAllDoctors] = useState([]);
    const { services, pid } = useParams(); // Get service name and patient ID from URL params
    const navigate = useNavigate();
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const { patient, setDoctorId } = usePatient(); // Get patient info and doctor setter from context

    useEffect(() => {
        // Fetch all doctors
        axios.get(`${ip.address}/api/doctor/api/alldoctor`)
            .then((res) => {
                console.log('Fetched doctors:', res.data.theDoctor); // Log the response to see if doctors are fetched
                // Filter doctors who provide the selected service by name
                const filteredDoctors = res.data.theDoctor.filter(doctor => 
                    doctor.dr_services && doctor.dr_services.some(service => service.name.toLowerCase() === services.toLowerCase()) // Match by service name
                );
                console.log('Filtered doctors:', filteredDoctors); // Log filtered doctors
                setAllDoctors(filteredDoctors);
            })
            .catch((err) => {
                console.log('Error fetching doctors:', err);
            });
    }, [services]);

    const handleDoctorClick = (did) => {
        setDoctorId(did); // Set selected doctor ID in context
        navigate(`/doctorprofile`); // Navigate to doctor profile
    };

    return (
        <>
            <PatientNavBar pid={patient._id}/> {/* Patient navigation bar */}

            <div style={{ paddingTop: '40px' }}></div>

            <div className="cd-main">
                <div className="cd-containergrid">
                    {theDoctors.length > 0 ? (
                        theDoctors.map((doctor, index) => {
                            const doctorImage = doctor.dr_image || defaultImage;
                            return (
                                <Card key={index} className="cd-card" onClick={() => handleDoctorClick(doctor._id)}>
                                    <Card.Img variant="top" src={`${ip.address}/${doctorImage}`} />
                                    <Card.Body>
                                        <Card.Title style={{ textAlign: "center" }}>
                                            {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                                        </Card.Title>
                                        <p style={{ textAlign: 'center', fontSize: '14px', fontStyle: 'italic' }}>
                                            {doctor.dr_specialty}
                                        </p>
                                        <Card.Text>
                                            "Lorem ipsum dolor sit amet, consectetur"
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            );
                        })
                    ) : (
                        <p>No doctors found</p> // Add a fallback in case no doctors match the filter
                    )}
                </div>
            </div>
        </>
    );
}

export default ChooseDoctorServices;
