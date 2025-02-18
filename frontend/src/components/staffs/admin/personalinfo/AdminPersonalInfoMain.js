import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Container, Button } from 'react-bootstrap';
import AdminPersonalInfo from "./AdminPersonalInfo";
import SidebarAdmin from "../sidebar/SidebarAdmin";
import AdminNavbar from "../navbar/AdminNavbar";
import TwoFactorAuth from "../../../patient/patientinformation/TwoFactorAuth/TwoFactorAuth";
import ChatComponent from "../../../chat/ChatComponent";
import { ChatDotsFill } from "react-bootstrap-icons";

function AdminPersonalInfoMain() {
    const location = useLocation();
    const { userId, userName, role } = useLocation().state;
    console.log(location.state);
    const [activeTab, setActiveTab] = useState("info");
    const [showChat, setShowChat] = useState(false);



    return (
        <div className="d-flex justify-content-center m-0 p-0">
            <SidebarAdmin userId={userId} userName={userName} role={role} />

            <Container className="cont-fluid-no-gutter" fluid style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
                <AdminNavbar userId={userId} userName={userName} role={role} />
                <Container fluid className="ad-container p-5" style={{ overflowY: 'hidden' }}>
                    <div className="maincolor-container">
                        <Container className="content-area px-5 mt-3">

                            <Container>
                                {/* Horizontal Tabs */}
                                <div className="horizontal-tabs">
                                    <a
                                        onClick={() => setActiveTab("info")}
                                        className={activeTab === "info" ? "active" : ""}
                                    >
                                        My details
                                    </a>

                                </div>
                            </Container>



                            <Container fluid className="border-top">
                                {activeTab === 'info' && < AdminPersonalInfo userId={userId} userName={userName} role={role} />}
                            </Container>

                            <div className="chat-btn-container">
                                <Button
                                    className="chat-toggle-btn"
                                    onClick={() => setShowChat(!showChat)}
                                >
                                    <ChatDotsFill size={30} />
                                </Button>
                            </div>

                            {showChat && (
                                <div className="chat-overlay">
                                    {showChat && (
                                        <div className="chat-overlay">
                                            <ChatComponent
                                                userId={userId}
                                                userRole={role}
                                                closeChat={() => setShowChat(false)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}


                        </Container>
                    </div>

                </Container>

            </Container>
        </div>
    );
}

export default AdminPersonalInfoMain;
