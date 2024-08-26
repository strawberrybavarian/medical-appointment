import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {Nav, Container} from 'react-bootstrap';

import SidebarMenu from "../sidebar/SidebarMenu";
import AccountInfo from "./AccountInfo";
import DrTwoFactorAuth from "./DrTwoFactorAuth";
import DoctorAvailability from "./DoctorAvailability"; // Import the new component

function DoctorInformation() {
    const { did } = useParams();
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
        <div style={{ display: "flex", flex: "1 0 auto", height: "100vh", overflowY: "hidden" }}>
            <SidebarMenu doctor_image={theImage} doctor_name={theName} did={theId} />
            <Container> 
                <Nav fill variant="tabs" defaultActiveKey="/home">
                    <Nav.Item>
                        <Nav.Link onClick={() => setActiveTab("info")}>My Personal Information</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link onClick={() => setActiveTab("availability")}>Manage Availability</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link onClick={() => setActiveTab("DrTwoFactorAuth")}>Two Factor Authentication</Nav.Link>
                    </Nav.Item>
                   
                </Nav>
                {activeTab === 'info' && <AccountInfo />}
                {activeTab === 'DrTwoFactorAuth' && <DrTwoFactorAuth setId={did} />}
                {activeTab === 'availability' && <DoctorAvailability doctorId={did} />} 
            </Container>
        </div>
    );
}

export default DoctorInformation;
