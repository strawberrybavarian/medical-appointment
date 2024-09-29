import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Collapse } from 'react-bootstrap';
import axios from "axios";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { ip } from "../../../ContentExport";
import DoctorWeeklySchedule from './DoctorWeeklySchedule';
import AppointmentForm from './AppointmentForm';
import './DoctorProfile.css';
import DoctorAnnouncements from "./DoctorAnnouncements";
import DoctorCalendar from "./DoctorCalendar";
import { usePatient } from "../PatientContext";
import Footer from "../../Footer";
function DoctorProfile() {
    const [theDoctor, setTheDoctor] = useState(null); // Initialize as null
    const [theImage, setTheImage] = useState("");
    const [FullName, setFullName] = useState("");
    const [thePost, setThePost] = useState([]);

    const [openProfile, setOpenProfile] = useState(false); 
    const [openAnnouncements, setOpenAnnouncements] = useState(false);
    const [openCalendar, setOpenCalendar] = useState(false);

    const { doctorId, patient } = usePatient(); // Get doctorId and patient from context

    // Ensure we only attempt to fetch data if doctorId is present
    useEffect(() => {
        if (doctorId) {
            axios.get(`${ip.address}/doctor/api/finduser/${doctorId}`)
                .then((res) => {
                    const doctor = res.data.theDoctor;
                    setTheDoctor(doctor);

                    const formattedName = `${doctor.dr_firstName} ${doctor.dr_middleInitial ? doctor.dr_middleInitial + '.' : ''} ${doctor.dr_lastName}`;
                    setFullName(formattedName);

                    setTheImage(doctor.dr_image || "images/014ef2f860e8e56b27d4a3267e0a193a.jpg");
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [doctorId]); // Call useEffect unconditionally, logic inside only executes if doctorId is present

    // Fetch doctor posts if doctorId is present
    useEffect(() => {
        if (doctorId) {
            axios.get(`${ip.address}/doctor/api/post/getallpost/${doctorId}`)
                .then((res) => {
                    setThePost(res.data.posts);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [doctorId]);

    // If doctorId is not available, return null or redirect
    if (!doctorId) {
        return <p>Please select a doctor.</p>;
    }

    // Only render the component when theDoctor has been fetched
    return theDoctor ? (
        <>
            <PatientNavBar pid={patient._id} />
            <Container className='cont-fluid-no-gutter' fluid style={{overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem'}}>
                <Container className='maincolor-container'>
                    <div className="content-area">
                        <Row>
                        <Col md={6}>
                            <Container className="dp-container1 white-background shadow-sm">
                                <img src={`${ip.address}/${theImage}`} alt="Doctor" className='dp-image' />
                                <div className="dp-container2">
                                    <h4>{FullName}</h4>
                                    <p style={{ fontStyle: 'italic', fontSize: '14px' }}>{theDoctor.dr_specialty}</p>
                                </div>
                            </Container>

                            <Container className="p-3 shadow-sm white-background dp-container11 mt-3">
                                <DoctorWeeklySchedule did={doctorId} />
                            </Container>

                            {/* Doctor Profile Section */}
                            <Container className="announcement-container white-background align-items-center mt-3 mb-3 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <div className="w-100 d-flex align-items-center">
                                        <span className="m-0" style={{ fontWeight: 'bold' }}>Doctor Profile</span>
                                    </div>

                                    <div className="w-100 d-flex justify-content-end align-items-center">
                                        <Link
                                            onClick={() => setOpenProfile(!openProfile)}
                                            aria-controls="profile-collapse"
                                            aria-expanded={openProfile}
                                            className="link-collapse"
                                            style={{ transition: 'transform 0.3s ease' }}
                                        >
                                            {openProfile ? <span>&#8722;</span> : <span>&#43;</span>}
                                        </Link>
                                    </div>
                                </div>

                                <Collapse in={openProfile}>
                                    <div id="profile-collapse">
                                        {/* Content for Doctor Profile goes here */}
                                        <DoctorAnnouncements posts={thePost} />
                                    </div>
                                </Collapse>
                            </Container>

                            {/* Announcements Section */}
                            <Container className="announcement-container white-background align-items-center mt-3 mb-3 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <div className="w-100 d-flex align-items-center">
                                        <p className="m-0" style={{ fontWeight: 'bold' }}>Announcements</p>
                                    </div>

                                    <div className="w-100 d-flex justify-content-end align-items-center">
                                        <Link
                                            onClick={() => setOpenAnnouncements(!openAnnouncements)}
                                            aria-controls="announcements-collapse"
                                            aria-expanded={openAnnouncements}
                                            className="link-collapse"
                                            style={{ transition: 'transform 0.3s ease' }}
                                        >
                                            {openAnnouncements ? <span>&#8722;</span> : <span>&#43;</span>}
                                        </Link>
                                    </div>
                                </div>

                                <Collapse in={openAnnouncements}>
                                    <div id="announcements-collapse">
                                        <DoctorAnnouncements posts={thePost} />
                                    </div>
                                </Collapse>
                            </Container>

                            {/* Doctor Calendar Section */}
                            <Container className="announcement-container white-background align-items-center mt-3 mb-3 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <div className="w-100 d-flex align-items-center">
                                        <p className="m-0" style={{ fontWeight: 'bold' }}>Doctor Calendar</p>
                                    </div>

                                    <div className="w-100 d-flex justify-content-end align-items-center">
                                        <Link
                                            onClick={() => setOpenCalendar(!openCalendar)}
                                            aria-controls="calendar-collapse"
                                            aria-expanded={openCalendar}
                                            className="link-collapse"
                                            style={{ transition: 'transform 0.3s ease' }}
                                        >
                                            {openCalendar ? <span>&#8722;</span> : <span>&#43;</span>}
                                        </Link>
                                    </div>
                                </div>

                                <Collapse in={openCalendar}>
                                    <div id="calendar-collapse">
                                        <DoctorCalendar did={doctorId} />
                                    </div>
                                </Collapse>
                            </Container>
                        </Col>

                        <Col md={6}>
                            <Container className="shadow-sm white-background dp-container1">
                                <AppointmentForm did={doctorId} pid={patient._id}/>
                            </Container>
                        </Col>
                    </Row>
                    </div>

                </Container>

                <Container fluid className='cont-fluid-no-gutter' style={{marginTop: '10rem'}}>
                <Footer />
            </Container>
            </Container>
        
        </>
    ) : null; // Don't render anything until `theDoctor` is fetched
}

export default DoctorProfile;
