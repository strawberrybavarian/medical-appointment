import React, { useState } from 'react';
import ManageSpecialty from './ManageSpecialty';
import SidebarAdmin from '../sidebar/SidebarAdmin';
import { Container, Row, Col } from 'react-bootstrap';
import AdminNavbar from '../navbar/AdminNavbar';
import { useLocation, useParams } from 'react-router-dom';
import ManageServices from './ManageServices';
import ManageHMO from './ManageHMO';
function SasMain() {

    const [activeTab, setActiveTab] = useState('specialty'); // Default tab
    const location = useLocation();
    const { userId, userName, role } = location.state || {};
    return (
        <>
            <div className='d-flex w-100'>
                <SidebarAdmin userId={userId} userName={userName} role={role} />
                <div className='w-100'>
                    <AdminNavbar userId={userId} userName={userName} role={role} />
                    <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
                        <div className='maincolor-container p-0'>
                            <div className='content-area p-0'>
                                {/* Horizontal Tabs */}
                                <Container>

                               
                                <div className="horizontal-tabs">
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
                                <Container className="border-top">
                                    <Row className="mt-4">
                                        <Col>
                                            {/* Conditionally Render Components Based on Active Tab */}
                                            {activeTab === 'specialty' && <ManageSpecialty aid={userId} />}
                                            {activeTab === 'services' && <ManageServices aid={userId}/>}
                                            {activeTab === 'hmo' && <ManageHMO aid={userId}/>}
                                        </Col>
                                    </Row>
                                </Container>
                                
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </>
    );
}

export default SasMain;
