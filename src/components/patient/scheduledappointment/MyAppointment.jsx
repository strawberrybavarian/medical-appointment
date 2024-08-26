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

            <div className="ma-container">
                <div className="ma-container1">
                    <Nav fill variant="tabs" defaultActiveKey="/home">
                        <Nav.Item>
                            <Nav.Link onClick={() => setActiveTab("pending")}>Pending Appointments</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link onClick={() => setActiveTab("active")}>Scheduled Appointments</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link onClick={() => setActiveTab("cancel")}>Cancelled Appointments</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link onClick={() => setActiveTab("completed")}>Completed Appointment</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link onClick={() => setActiveTab("rescheduled")}>Rescheduled Appointment</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </div>
            </div>

            {activeTab === "pending" && <PendingAppointments appointments={appointments} setAppointments={setAppointments} />}
            {activeTab === "active" && <ActiveAppointment appointments={appointments} setAppointments={setAppointments} />}
            {activeTab === "cancel" && <CancelledAppointments />}
            {activeTab === "completed" && <CompleteAppointment />}
            {activeTab === "rescheduled" && <RescheduledAppointment />}
        </>
    );
}

export default MyAppointment;
