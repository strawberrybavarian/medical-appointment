import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import './Appointment.css'
import PrescriptionPatientModal from "./Modal/PrescriptionPatientModal";

function CompleteAppointment() {
    const [theDoctor, setAllDoctor] = useState([]);
    const { pid } = useParams(); 
    const navigate = useNavigate();
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                setAllDoctor(res.data.thePatient.patient_appointments);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pid]);

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleNextModal = (doctor) => {
        setSelectedAppointment(doctor);
        setShowModal(true);
    };
 
    return (
        <>
            <div className='mainContainer'>
                <div>
                    {theDoctor
                        .filter(appointment => appointment.status === 'Completed')
                        .reverse()
                        .map((doctor, index) => {
                            const doctorImage = doctor?.doctor.dr_image || defaultImage;
                            return (
                                <div className="subContainer" key={index}>
                                    <div className="aContainer">
                                        <div> 
                                            <img src={`http://localhost:8000/${doctorImage}`} alt="Doctor" className='app-image' />
                                        </div>
                                        <div>
                                            <p style={{ marginLeft: '10px' }}> Dr. {doctor.doctor.dr_firstName} {doctor.doctor.dr_middleInitial}. {doctor.doctor.dr_lastName} </p>
                                            <p style={{ marginLeft: '10px' }}> Status: {doctor.status} </p>
                                            <p style={{ marginLeft: '10px' }}> Date/Time: {doctor.date}/{doctor.time} </p>
                                        </div>
                                    </div>
                                    <div className="bContainer">
                                        <Button onClick={() => handleNextModal(doctor)}>View Prescription</Button>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
            <PrescriptionPatientModal 
                show={showModal} 
                handleClose={handleCloseModal} 
                appointment={selectedAppointment}
            />
        </>
    );
}

export default CompleteAppointment;
