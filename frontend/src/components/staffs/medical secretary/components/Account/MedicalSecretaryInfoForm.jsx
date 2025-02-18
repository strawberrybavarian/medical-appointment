import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import UpdateInfoModal from './Modals/UpdateInfoModal';
import ChangePasswordModal from './Modals/ChangePasswordModal';
import TwoFactorAuth from '../../../../patient/patientinformation/TwoFactorAuth/TwoFactorAuth';
const MedicalSecretaryInfoForm = ({ msid }) => {
  const [medSecData, setMedSecData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showTwoFactorAuthModal, setShowTwoFactorAuthModal] = useState(false);  // New state for the 2FA modal

  useEffect(() => {
    // Fetch the Medical Secretary's information
    axios.get(`${ip.address}/api/medicalsecretary/api/findone/${msid}`)
      .then(response => {
        setMedSecData(response.data.theMedSec);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Medical Secretary data:', err);
        setIsLoading(false);
      });
  }, [msid]);
  
  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = (updatedData) => {
    if (updatedData) {
      setMedSecData(prevState => ({
        ...prevState,
        ...updatedData, // Update with new information
      }));
    }
    setIsUpdateModalOpen(false);
  };

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };


  const handleEnableDisableTwoFa = async () => {
    if (twoFaEnabled) {
      // Disable 2FA if already enabled
      try {
        const response = await axios.post(`${ip.address}/api/disable-2fa`, { 
          userId: medSecData._id, 
          role: medSecData.role 
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
  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="ai-container2 shadow-sm">
      <div className='d-flex justify-content-start align-items-center'>
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
          <Button variant="primary" onClick={openUpdateModal} className="mt-3">
            Update Information
          </Button>
          <Button variant="secondary" onClick={openChangePasswordModal} className="mt-3 ms-2">
            Change Password
          </Button>
        </div>
      </div>

      <Form className='mt-5'> 
        <Row>
          <Col md={6}>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" value={medSecData.ms_firstName || ''} disabled />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" value={medSecData.ms_lastName || ''} disabled />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" value={medSecData.ms_username || ''} disabled />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={medSecData.ms_email || ''} disabled />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group controlId="formContactNumber">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control type="text" value={medSecData.ms_contactNumber || ''} disabled />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formRole">
              <Form.Label>Role</Form.Label>
              <Form.Control type="text" value={medSecData.role || ''} disabled />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {showTwoFactorAuthModal && (
        <TwoFactorAuth 
          show={showTwoFactorAuthModal} 
          handleClose={() => setShowTwoFactorAuthModal(false)} 
    
        />
      )}

      <UpdateInfoModal
        show={isUpdateModalOpen}
        handleClose={closeUpdateModal}
        currentData={medSecData} // Pass current data to the modal
      />

      <ChangePasswordModal
        show={isChangePasswordModalOpen}
        handleClose={closeChangePasswordModal}
        msid={msid}
        email={medSecData.ms_email} // Pass the email for validation
        password={medSecData.ms_password} // Pass the current password for validation
      />
    </div>
  );
};

export default MedicalSecretaryInfoForm;
