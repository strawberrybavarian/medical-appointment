import React from 'react';
import SidebarMenu from '../sidebar/SidebarMenu';
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import './MainInformation.css'; 
import { Container } from 'react-bootstrap';
import PractitionerNavBar from './navbar/PractitionerNavBar';
import DoctorNavbar from '../navbar/DoctorNavbar';
import Footer from '../../Footer';
import { ChevronLeft } from 'react-bootstrap-icons';
import { ip } from '../../../ContentExport';

function MainInformation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pid, did, apid } = location.state || {};

    const [theId, setTheId] = useState("");
    const [theName, setTheName] = useState("");
    const [theImage, setTheImage] = useState("");
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

    useEffect(() => {
        axios.get(`${ip.address}/doctor/api/finduser/${did}`)
            .then((res) => {
                setTheId(res.data.theDoctor._id);
                setTheName(res.data.theDoctor.dr_firstName);
                setTheImage(res.data.theDoctor.dr_image || defaultImage);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [did]);

    return (
        <div className="d-flex justify-content-center">
            <SidebarMenu doctor_image={theImage} doctor_name={theName} did={did} />
            <div style={{ width: '100%' }}>
                <DoctorNavbar doctor_image={theImage} did={did}/> 
                <Container fluid className='cont-fluid-no-gutter' style={{ overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem' }}>
                    <div className='maincolor-container'>
                        <div className='content-area'>
                            {/* Back Button */}
                            <Container className='d-flex align-items-center flex-row '>
                            <Link
                                to="/mainappointment?outerTab=mypatients&innerTab=ongoing"
                                state={{ did }}
                                className="mb-3 no-decoration"
                                style={{ marginTop: '8px' }}
                            >
                                <ChevronLeft size={20} className="ml-5" /> Back
                            </Link>
                                <h3 style={{ marginLeft: '1.5rem' }}>Patient Information Management</h3>
                            </Container>
                            {/* Practitioner NavBar */}
                            <PractitionerNavBar pid={pid} did={did} apid={apid} />
                        </div>
                        <Container fluid className="footer-container cont-fluid-no-gutter w-100">
                            <Footer />
                        </Container>
                    </div>
                </Container>
            </div>
        </div>
    );
}

export default MainInformation;
