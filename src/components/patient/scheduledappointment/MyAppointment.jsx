import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import './Appointment.css'
import ActiveAppointment from "./Appointments";
import CancelledAppointments from "./CancelledAppointments";
import CompleteAppointment from "./CompleteAppointment";
import PendingAppointments from "./PendingAppointment";
import RescheduledAppointment from "./RescheduledAppointments";

function MyAppointment() {
    const [activeTab, setActiveTab] = useState("pending");
    const [appointments, setAppointments] = useState([]);
    const { pid } = useParams(); 

    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                setAppointments(res.data.thePatient.patient_appointments);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pid]);

    return (
        <>
          
            <PatientNavBar/>

            <Container className="pt-5">
    <h2>My Appointments</h2>
    <p className="text-muted">See your appointment details.</p>
</Container>

            <Container className="d-flex pt-4">
    
            <Nav fill variant="tabs" className="app-navtabs" activeKey={activeTab}>
                <Nav.Item>
                    <Nav.Link eventKey="pending" onClick={() => setActiveTab("pending")}>Pending</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="active" onClick={() => setActiveTab("active")}>Scheduled </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="cancel" onClick={() => setActiveTab("cancel")}>Cancelled </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="completed" onClick={() => setActiveTab("completed")}>Completed </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="rescheduled" onClick={() => setActiveTab("rescheduled")}>Rescheduled </Nav.Link>
                </Nav.Item>
            </Nav>


            </Container>

            {/* Lalagay kung sino mga doctors parang suggestion */}
   
            {activeTab === "pending" && <PendingAppointments appointments={appointments} setAppointments={setAppointments} />}
            {activeTab === "active" && <ActiveAppointment appointments={appointments} setAppointments={setAppointments} />}
            {activeTab === "cancel" && <CancelledAppointments appointments={appointments} setAppointments={setAppointments}/>}
            {activeTab === "completed" && <CompleteAppointment appointments={appointments} setAppointments={setAppointments}/>}
            {activeTab === "rescheduled" && <RescheduledAppointment />}
        </>
    );
}

export default MyAppointment;
