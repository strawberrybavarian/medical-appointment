import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import { ip } from '../../../../ContentExport';
import axios from 'axios';

//Components
import SidebarAdmin from '../sidebar/SidebarAdmin';
import AdminNavbar from '../navbar/AdminNavbar';
import * as Icon from "react-bootstrap-icons";

import AdminEditInfoModal from './AdminEditInfoModal';
import AdminChangePasswordModal from './AdminChangePasswordModal';
import AuditAdmin from './AuditAdmin';

const AdminPersonalInfo = () => {

    const location = useLocation();
    const {userId, userName, role} = useLocation().state;
    console.log(location.state);

    const [admin, setAdmin] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthdate: '',
        contactNumber: ''
    });

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    console.log(admin.contactNumber)
    useEffect(() => {  
        axios.get(`${ip.address}/api/admin/${userId}`)
            .then(response => {
                setAdmin(response.data.theAdmin);
            })
            .catch(error => {
                console.error('Error fetching admin:', error);
            });

     }, []);
    

     const maskEmail = (email) => {
        if (!email || !email.includes("@")) {
          return email;  // Return the original email if no '@' symbol
        }
    
        const [namePart, domainPart] = email.split("@");
        const maskedName = namePart[0] + "****" + namePart[namePart.length - 1];
        const domainParts = domainPart.split(".");
        const maskedDomain =
          domainParts[0][0] + "***" + domainParts[0][domainParts[0].length - 1];
        const topLevelDomain = domainParts[1];
    
        return `${maskedName}@${maskedDomain}.${topLevelDomain}`;
      };
    

    const handleCloseModal = () => {
        setShowInfoModal(false);
        setShowPasswordModal(false);
    }
    return (
        <>
            <div className="d-flex justify-content-center">
                <SidebarAdmin userId={userId} userName={userName} role={role} />

                <Container className="cont-fluid-no-gutter" fluid style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
                    <AdminNavbar userId={userId} userName={userName} role={role} />
                        <Container fluid className="ad-container p-5" style={{  overflowY: 'hidden' }}>
                        <div className="content-area p-0 m-0">
                            <div className="p-3">
                            <h3 className="m-0">Account Details</h3>
                            <p className="m-0">Manage your Profile</p>
                            <hr />
                            </div>
                    
                            <Container fluid>
                            
              
                    
                            <Form className='pi-container2 shadow-sm mb-5 '>
                                <div className="justify-content-end">
                                <Row>
                                    <Form.Group as={Col} controlId="firstName">
                                    <Form.Label>First Name:</Form.Label>
                                    <Form.Control value={admin.firstName} disabled className="form-picontrol" />
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="lastName">
                                    <Form.Label>Last Name:</Form.Label>
                                    <Form.Control value={admin.lastName} disabled className="form-picontrol" />
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="email">
                                    <Form.Label>Email:</Form.Label>
                                    <Form.Control value={maskEmail(admin.email)} disabled className="form-picontrol" />
                                    </Form.Group>
                                </Row>

                                <Row>
                                    <Form.Group as={Col} controlId="dob">
                                    <Form.Label>Birthdate:</Form.Label>
                                    <Form.Control value={admin.birthdate || 'No Birthdate'} className="form-picontrol" disabled />
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="contactNumber">
                                    <Form.Label>Contact Number:</Form.Label>
                                    <Form.Control value={admin.contactNumber} className="form-picontrol"  disabled />
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <Col className="text-center mt-3">
                                    {/* Button to open update modal */}
                                    <Button variant="primary" onClick={() => setShowInfoModal(true)}  >
                                        Edit Information
                                    </Button>
                                    {/* Change Password link */}
                                    <Button variant="link" onClick={() => setShowPasswordModal(true) } >
                                        Change Password
                                    </Button>
                                    </Col>
                                </Row>
                                </div>
                            </Form>

                            <Container fluid className="pi-container2 shadow-sm mb-5">
                            
                                <h4>Activity Log</h4>
                                <hr />
                                <AuditAdmin adminId={userId} />
                            </Container>
                    
                    
                    
                            
                            </Container>
                    
                            </div>
                        </Container>
                
                
                </Container>

                <AdminChangePasswordModal 
                    show={showPasswordModal} 
                    handleClose={handleCloseModal} 
                    admin={admin}
                />

                <AdminEditInfoModal
                    show = {showInfoModal}
                    handleClose={handleCloseModal} 
                    adminId={admin._id}
                />
            </div>
        </>
    )

}

export default AdminPersonalInfo;