import React, { useState } from 'react';
import ManageSpecialty from './ManageSpecialty';
import SidebarAdmin from '../sidebar/SidebarAdmin';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AdminNavbar from '../navbar/AdminNavbar';
import { useLocation, useParams } from 'react-router-dom';
import ManageServices from './ManageServices';
import ManageHMO from './ManageHMO';
import ChatComponent from '../../../chat/ChatComponent';
import { ChatDotsFill } from 'react-bootstrap-icons';

function SasMain() {

    const [activeTab, setActiveTab] = useState('specialty'); // Default tab
    const [showChat, setShowChat] = useState(false);
    const location = useLocation();
    const { userId, userName, role } = location.state || {};
    return (
        <>
            <div className='d-flex w-100'>
                <SidebarAdmin userId={userId} userName={userName} role={role} />
                <div className='w-100'>
                    <AdminNavbar userId={userId} userName={userName} role={role} />
                    <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
                        <div className='maincolor-container'>
                            <div className='content-area '>

                                <Container className='px-3'>


                                    <div className="horizontal-tabs ">
                                        <a
                                            onClick={() => setActiveTab("specialty")}
                                            className={activeTab === "specialty" ? "active" : ""}
                                        >
                                            Manage Specialty
                                        </a>
                                        <a
                                            onClick={() => setActiveTab("services")}
                                            className={activeTab === "services" ? "active" : ""}
                                        >
                                            Manage Services
                                        </a>
                                        <a
                                            onClick={() => setActiveTab("hmo")}
                                            className={activeTab === "hmo" ? "active" : ""}
                                        >
                                            Manage HMO
                                        </a>
                                    </div>
                                </Container>
                                <Container fluid className="w-100 border-top">

                                    <Col>
                                        {/* Conditionally Render Components Based on Active Tab */}
                                        {activeTab === 'specialty' && <ManageSpecialty aid={userId} />}
                                        {activeTab === 'services' && <ManageServices aid={userId} />}
                                        {activeTab === 'hmo' && <ManageHMO aid={userId} />}
                                    </Col>

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


                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </>
    );
}

export default SasMain;
