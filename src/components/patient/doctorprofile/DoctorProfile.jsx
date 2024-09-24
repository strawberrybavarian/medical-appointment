import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Container, Row, Col, Collapse } from 'react-bootstrap';
import axios from "axios";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { ip } from "../../../ContentExport";
import DoctorWeeklySchedule from './DoctorWeeklySchedule';
import AppointmentForm from './AppointmentForm';
import './DoctorProfile.css';
import DoctorAnnouncements from "./DoctorAnnouncements";
import DoctorCalendar from "./DoctorCalendar";
function DoctorProfile() {
        const [theDoctor, setTheDoctor] = useState({});
        const [theImage, setTheImage] = useState("");
        const [FullName, setFullName] = useState("");
        const [thePost, setThePost] = useState([]);

        // Separate states for each collapsible section
        const [openProfile, setOpenProfile] = useState(false); 
        const [openAnnouncements, setOpenAnnouncements] = useState(false);
        const [openCalendar, setOpenCalendar] = useState(false);

        const location = useLocation();
        const { pid, did } = location.state || {}; // Destructure pid and did from state
        const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

        useEffect(() => {
            axios
                .get(`${ip.address}/doctor/api/finduser/${did}`)
                .then((res) => {
                    const doctor = res.data.theDoctor;
                    setTheDoctor(doctor);

                    const formattedName = `${doctor.dr_firstName} ${doctor.dr_middleInitial ? doctor.dr_middleInitial + '.' : ''} ${doctor.dr_lastName}`;
                    setFullName(formattedName);

                    setTheImage(doctor.dr_image || defaultImage);
                })
                .catch((err) => {
                    console.log(err);
                });
        }, [did]);

        useEffect(() => {
            axios
                .get(`${ip.address}/doctor/api/post/getallpost/${did}`)
                .then((res) => {
                    setThePost(res.data.posts);
                })
                .catch((err) => {
                    console.log(err);
                });
        }, [did]);

        // if (!theDoctor || Object.keys(theDoctor).length === 0) {
        //     return <p>Loading...</p>; 
        // }

    return (
        <>
            <PatientNavBar />
            <Container fluid className="dp-containermain maincolor-container p-5" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 96px)' }}>
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
                            <DoctorWeeklySchedule did={did} />
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
                                    <DoctorCalendar did={did} />
                                </div>
                            </Collapse>
                        </Container>
                    </Col>

                    <Col md={6}>
                        <Container className="shadow-sm white-background dp-container1">
                            <AppointmentForm did={did} pid={pid}/>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default DoctorProfile;
