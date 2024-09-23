import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Nav, Container } from 'react-bootstrap';

import SidebarMenu from "../sidebar/SidebarMenu";
import AccountInfo from "./AccountInfo";
import DrTwoFactorAuth from "./DrTwoFactorAuth";
import DoctorAvailability from "./DoctorAvailability"; 
import DoctorNavbar from "../navbar/DoctorNavbar";
import DoctorManageServices from "./DoctorManageServices";  // Import the new component

function DoctorInformation() {
    const location = useLocation();
    const { did } = location.state || {};
    const [allAppointments, setAllAppointments] = useState([]);
    const [theId, setTheId] = useState("");
    const [theName, setTheName] = useState("");
    const [theImage, setTheImage] = useState("");
    const [activeTab, setActiveTab] = useState("info");
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

    useEffect(() => {
        axios
            .get(`http://localhost:8000/doctor/api/finduser/${did}`)
            .then((res) => {
                setTheId(res.data.theDoctor._id);
                setTheName(res.data.theDoctor.dr_firstName);
                setTheImage(res.data.theDoctor.dr_image || defaultImage);
            })
            .catch((err) => {
                console.log(err);
            });

        axios
            .get(`http://localhost:8000/doctor/appointments/${did}`)
            .then((res) => {
                setAllAppointments(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [did]);

    return (
        <div className="maincolor-container d-flex justify-content-center">
            <SidebarMenu doctor_image={theImage} doctor_name={theName} did={theId} />
            <div style={{ width: '100%' }}> 
                <DoctorNavbar doctor_image={theImage}/>
                    <Container fluid className="ad-container" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '20px' }}>
                        <Nav fill variant="tabs" className="app-navtabs-doctor" defaultActiveKey="/home">
                            <Nav.Item>
                                <Nav.Link onClick={() => setActiveTab("info")}>My Personal Information</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link onClick={() => setActiveTab("availability")}>Manage Availability</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link onClick={() => setActiveTab("DrTwoFactorAuth")}>Two Factor Authentication</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link onClick={() => setActiveTab("services")}>Manage Services</Nav.Link> {/* Add the new tab */}
                            </Nav.Item>
                        </Nav>
                    
                        {activeTab === 'info' && <AccountInfo did={did} />}
                        {activeTab === 'DrTwoFactorAuth' && <DrTwoFactorAuth setId={did} />}
                        {activeTab === 'availability' && <DoctorAvailability doctorId={did} />} 
                        {activeTab === 'services' && <DoctorManageServices doctorId={did} />}  {/* Render the new component */}
                    
                    </Container>
            </div>
        </div>
    );
}

export default DoctorInformation;
