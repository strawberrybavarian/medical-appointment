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
import TwoFactorAuth from '../../../patient/patientinformation/TwoFactorAuth/TwoFactorAuth';

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
    const [twoFaEnabled, setTwoFaEnabled] = useState(false);
    const [showTwoFactorAuthModal, setShowTwoFactorAuthModal] = useState(false);  // New state for the 2FA modal
    
    // console.log(admin.contactNumber)
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


    
  const handleEnableDisableTwoFa = async () => {
    if (twoFaEnabled) {
      // Disable 2FA if already enabled
      try {
        const response = await axios.post(`${ip.address}/api/disable-2fa`, { 
          userId: userId, 
          role: role 
        });
        if (response.data.message === '2FA disabled successfully') {
          setTwoFaEnabled(false);
          alert('2FA Disabled Successfully');
        }
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        alert('Error disabling 2FA');
      }
    } else {
      // If 2FA is disabled, show the TwoFactorAuth modal to enable it
      setShowTwoFactorAuthModal(true);  // Open the 2FA modal
    }
  };
    return (
        <>
            <div className="d-flex justify-content-center">
               
                        <div className="content-area p-0 m-0">
                            
                    
                            
              
                    
                            <Form className='pi-container2 shadow-sm mb-5 '>
                                 <div className='d-flex justify-content-end w-100'>
                                            {twoFaEnabled ? (
                                              <Button variant="danger" className="mt-3" onClick={handleEnableDisableTwoFa}>
                                                Disable 2FA
                                              </Button>
                                            ) : (
                                              <Button variant="success" className="mt-3" onClick={handleEnableDisableTwoFa}>
                                                Enable 2FA
                                              </Button>
                                            )}

                                            <Button variant="primary" className="mt-3" onClick={() => setShowInfoModal(true)}  >
                                                Edit Information
                                            </Button>
                                            {/* Change Password link */}
                                            <Button variant="link"  className="mt-3" onClick={() => setShowPasswordModal(true) } >
                                                Change Password
                                            </Button>
                                
                                        </div>
                                <div className="justify-content-end mt-5">
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
                                    
                                    </Col>
                                </Row>
                                </div>
                            </Form>

                            <Container fluid className="pi-container2 shadow-sm mb-5">
                            
                                <h4>Activity Log</h4>
                                <hr />
                                <AuditAdmin adminId={userId} />
                            </Container>
                    
                    
                    
                            
   
                
                
            </div>

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

{showTwoFactorAuthModal && (
        <TwoFactorAuth 
          show={showTwoFactorAuthModal} 
          handleClose={() => setShowTwoFactorAuthModal(false)} 
    
        />
      )}
            </div>
        </>
    )

}

export default AdminPersonalInfo;