import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Nav, Container } from 'react-bootstrap';
import SidebarMenu from "../sidebar/SidebarMenu";
import AccountInfo from "./AccountInfo";
import DrTwoFactorAuth from "./DrTwoFactorAuth";
import DoctorAvailability from "./DoctorAvailability"; 
import DoctorNavbar from "../navbar/DoctorNavbar";
import DoctorManageServices from "./DoctorManageServices";  // Import the new component
import Footer from "../../Footer";
import { ChevronLeft } from "react-bootstrap-icons";
import './AccountInfo.css';
import { ip } from "../../../ContentExport";
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
            .get(`${ip.address}/api/doctor/api/finduser/${did}`)
            .then((res) => {
                setTheId(res.data.theDoctor._id);
                setTheName(res.data.theDoctor.dr_firstName);
                setTheImage(res.data.theDoctor.dr_image || defaultImage);
            })
            .catch((err) => {
                console.log(err);
            });

        axios
            .get(`${ip.address}/api/doctor/appointments/${did}`)
            .then((res) => {
                setAllAppointments(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [did]);

    return (
        <div className="d-flex justify-content-center">
            {/* <SidebarMenu doctor_image={theImage} doctor_name={theName} did={theId} /> */}
            <div style={{ width: '100%' }}> 
                <DoctorNavbar doctor_image={theImage} did={did}/>
                <Container fluid className='cont-fluid-no-gutter' style={{overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem'}}>
                        
                    <div className="maincolor-container">
                        <div className="content-area">
                            
                            <Container>
                                <Link
                                    to="/dashboard"
                                    state={{ did }}
                                    className="mb-3 no-decoration"
                                    style={{ marginTop: '8px' }}
                                >
                                    <ChevronLeft size={20} className="ml-5" /> Back
                                </Link>

                                {/* Horizontal Tabs */}
                                <div className="horizontal-tabs">
                                    <a
                                        onClick={() => setActiveTab("info")}
                                        className={activeTab === "info" ? "active" : ""}
                                    >
                                        My details
                                    </a>
                                    <a
                                        onClick={() => setActiveTab("availability")}
                                        className={activeTab === "availability" ? "active" : ""}
                                    >
                                        Availability
                                    </a>
                                    <a
                                        onClick={() => setActiveTab("DrTwoFactorAuth")}
                                        className={activeTab === "DrTwoFactorAuth" ? "active" : ""}
                                    >
                                        Authentication
                                    </a>
                                    <a
                                        onClick={() => setActiveTab("services")}
                                        className={activeTab === "services" ? "active" : ""}
                                    >
                                        Services
                                    </a>
                                </div> 
                            </Container>
                       
                            <Container className="border-top">
                                {activeTab === 'info' && <AccountInfo did={did} />}
                                {activeTab === 'DrTwoFactorAuth' && <DrTwoFactorAuth setId={did} />}
                                {activeTab === 'availability' && <DoctorAvailability doctorId={did} />} 
                                {activeTab === 'services' && <DoctorManageServices doctorId={did} />}
                            </Container>
                        </div>

                        <Container fluid className="footer-container cont-fluid-no-gutter w-100 mt-5">
                            <Footer />
                        </Container>
                    </div>
                </Container>
            </div>
        </div>
    );
}

export default DoctorInformation;
