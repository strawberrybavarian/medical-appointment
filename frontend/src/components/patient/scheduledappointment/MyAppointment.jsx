import { Container, Row, Col, Nav } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import './Appointment.css';
import ActiveAppointment from "./Appointments";
import CancelledAppointments from "./CancelledAppointments";
import CompleteAppointment from "./CompleteAppointment";
import PendingAppointments from "./PendingAppointment";
import RescheduledAppointment from "./RescheduledAppointments";
import VerticalDoctorList from "./VerticalDoctorList";
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Footer from '../../Footer';
import { ip } from '../../../ContentExport';

function MyAppointment() {
    const [activeTab, setActiveTab] = useState("pending");
    const [appointments, setAppointments] = useState([]);
    const location = useLocation();
    const { pid } = location.state || {};
    console.log('MyAPpointment',pid);
    
    useEffect(() => {
        axios.get(`${ip.address}/patient/api/onepatient/${pid}`)
            .then((res) => {
                setAppointments(res.data.thePatient.patient_appointments);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pid]);

    return (
        <>
            <Helmet>
                <title>Molino Care | Patient</title>
            </Helmet>
            <PatientNavBar pid={pid} />
            <Container className='cont-fluid-no-gutter' fluid style={{overflowY: 'scroll', height: '100vh', paddingBottom: '90px', paddingTop: '1.5rem'}}>
            <div className='maincolor-container' >

            <div className='content-area'>
            <Container>
                    <h2>My Appointments</h2>
                    <p className="text-muted">See your appointment details.</p>
                </Container>
                <Container>
                    <Row>

                        {/* Scrollable Doctor List */}
                        {/* <Col md={4} className="scrollable-doctor-list">
                            <VerticalDoctorList pid={pid} />
                        </Col> */}

                        {/* Scrollable Appointments Section */}
                        <Col md={8}>
                            <Container className="d-flex content-area">
                                <Nav fill variant="tabs" className="app-navtabs" activeKey={activeTab}>
                                    <Nav.Item>
                                        <Nav.Link eventKey="pending" onClick={() => setActiveTab("pending")}>Pending</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="active" onClick={() => setActiveTab("active")}>Scheduled</Nav.Link>
                                    </Nav.Item>
                                  
                                    <Nav.Item>
                                        <Nav.Link eventKey="completed" onClick={() => setActiveTab("completed")}>Completed</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="cancel" onClick={() => setActiveTab("cancel")}>Cancelled</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="rescheduled" onClick={() => setActiveTab("rescheduled")}>Rescheduled</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Container>

                            <div className='content-area mb-5'>
                                {activeTab === "pending" && <PendingAppointments appointments={appointments} setAppointments={setAppointments} />}
                                {activeTab === "active" && <ActiveAppointment appointments={appointments} setAppointments={setAppointments} />}
                                {activeTab === "cancel" && <CancelledAppointments appointments={appointments} setAppointments={setAppointments} />}
                                {activeTab === "completed" && <CompleteAppointment appointments={appointments} setAppointments={setAppointments} />}
                                {activeTab === "rescheduled" && <RescheduledAppointment appointments={appointments} setAppointments={setAppointments} />}
                            </div>
                        </Col>
                     
                    </Row>
                    
                </Container>

            </div>

                            <div className="footer-container w-120 p-0 m-0 ">
                                <Footer />
                            </div>
            </div>
                
                
            </Container>
        </>
    );
}

export default MyAppointment;
