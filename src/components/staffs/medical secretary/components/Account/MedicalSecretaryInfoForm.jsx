import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import UpdateInfoModal from './Modals/UpdateInfoModal';
import ChangePasswordModal from './Modals/ChangePasswordModal';

const MedicalSecretaryInfoForm = ({ msid }) => {
  const [medSecData, setMedSecData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  useEffect(() => {
    // Fetch the Medical Secretary's information
    axios.get(`${ip.address}/medicalsecretary/api/findone/${msid}`)
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

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="ai-container2 shadow-sm">
      <div className='d-flex justify-content-start align-items-center'>
        <div className='d-flex justify-content-end w-100'>
          <Button variant="primary" onClick={openUpdateModal} className="mt-3">
            Update Information
          </Button>
          <Button variant="secondary" onClick={openChangePasswordModal} className="mt-3 ms-2">
            Change Password
          </Button>
        </div>
      </div>

      <Form>
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
