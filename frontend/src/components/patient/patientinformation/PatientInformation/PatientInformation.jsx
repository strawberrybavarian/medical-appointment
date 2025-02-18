import { Row, Col, Form, Container, Button, Image } from 'react-bootstrap';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';  
import UpdatePatientInfoModal from './UpdatePatientInfoModal';  
import UpdatePatientImageModal from './UpdatePatientImageModal'; 
import './PatientInformation.css';
import * as Icon from "react-bootstrap-icons";
import { ip } from '../../../../ContentExport';
import Footer from '../../../Footer';
import TwoFactorAuth from '../TwoFactorAuth/TwoFactorAuth';

function PatientInformation({ pid }) {
  const [thePatient, setThePatient] = useState();
  const [theName, setTheName] = useState("");
  const [theLastName, setTheLastName] = useState("");
  const [theMI, setTheMI] = useState("");
  const [email, setEmail] = useState("");
  const [cnumber, setCnumber] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [lastProfileUpdate, setLastProfileUpdate] = useState(null);
  const [image, setImage] = useState("images/014ef2f860e8e56b27d4a3267e0a193a.jpg");
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showTwoFactorAuthModal, setShowTwoFactorAuthModal] = useState(false);  // New state for the 2FA modal

  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
      .then((res) => {
        const patientData = res.data.thePatient;
        setThePatient(patientData);
        setTheName(patientData.patient_firstName);
        setTheLastName(patientData.patient_lastName);
        setTheMI(patientData.patient_middleInitial);
        setEmail(patientData.patient_email);
        setCnumber(patientData.patient_contactNumber);
        setDob(patientData.patient_dob);
        setPassword(patientData.patient_password);
        setLastProfileUpdate(new Date(patientData.lastProfileUpdate));
        setImage(patientData.patient_image || "images/default-profile.png");
        setTwoFaEnabled(patientData.twoFactorEnabled);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [pid]);



  const maskEmail = (email) => {
    if (!email || !email.includes("@")) {
      return email;
    }

    const [namePart, domainPart] = email.split("@");
    const maskedName = namePart[0] + "****" + namePart[namePart.length - 1];
    const domainParts = domainPart.split(".");
    const maskedDomain = domainParts[0][0] + "***" + domainParts[0][domainParts[0].length - 1];
    const topLevelDomain = domainParts[1];

    return `${maskedName}@${maskedDomain}.${topLevelDomain}`;
  };

  const handleEnableDisableTwoFa = async () => {
    if (twoFaEnabled) {
      // Disable 2FA if already enabled
      try {
        const response = await axios.post(`${ip.address}/api/disable-2fa`, { 
          userId: pid, 
          role: thePatient.role 
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

  const handleImageUpload = (newImage) => {
    setImage(newImage);
  };

  const canUpdate = () => {
    if (!lastProfileUpdate) {
      return true;  // Allow update if no lastProfileUpdate is available (first time update)
    }

    const currentDate = new Date();
    const daysSinceLastUpdate = Math.floor((currentDate - lastProfileUpdate) / (1000 * 60 * 60 * 24));
    return daysSinceLastUpdate >= 30;
  };

  const handleShowInfoModal = () => {
    if (canUpdate()) {
      setShowInfoModal(true);
    } else {
      alert("You can only update your information every 30 days.");
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setShowInfoModal(false);
    setShowImageModal(false);
  };

  return (
    <>
      <Container fluid className="maincolor-container" style={{ height: '100vh' }}>
        <div className="content-area p-0 m-0">
          <div className="p-3">
            <h3 className="m-0">Account Details</h3>
            <p className="m-0">Manage your Profile</p>
            <hr />
          </div>

          <Container>
            <div className='pi-container2 d-flex align-items-center shadow-sm mb-4'> 
              <img src={`${ip.address}/${image}`} alt="Doctor" className="ai-image" />
              <div style={{marginLeft: '1rem'}} className="d-flex align-items-center justify-content-between w-100">
                <div>
                  <h4 className="m-0">{theName}</h4>
                  <p style={{fontSize: '15px'}}>Patient</p>
                </div>

                <div>
                  {/* Ternary operator to toggle 2FA */}
                  {twoFaEnabled ? (
                    <Button variant="danger" className="mr-2" onClick={handleEnableDisableTwoFa}>
                      Disable 2FA
                    </Button>
                  ) : (
                    <Button variant="success" className="mr-2" onClick={handleEnableDisableTwoFa}>
                      Enable 2FA
                    </Button>
                  )}
                  <Button onClick={() => setShowImageModal(true)}>Upload Image<Icon.Upload style={{marginLeft:'0.4rem'}} /></Button>
                </div>
              </div>
            </div>

            <Form className='pi-container2 shadow-sm mb-5'>
              <Row>
                <Form.Group as={Col} controlId="firstName">
                  <Form.Label>First Name:</Form.Label>
                  <Form.Control value={theName} disabled className="form-picontrol" />
                </Form.Group>
                <Form.Group as={Col} controlId="lastName">
                  <Form.Label>Last Name:</Form.Label>
                  <Form.Control value={theLastName} disabled className="form-picontrol" />
                </Form.Group>
                <Form.Group as={Col} controlId="middleInitial">
                  <Form.Label>Middle Initial:</Form.Label>
                  <Form.Control value={theMI} disabled className="form-picontrol" />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} controlId="email">
                  <Form.Label>Email:</Form.Label>
                  <Form.Control value={maskEmail(email)} disabled className="form-picontrol" />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} controlId="dob">
                  <Form.Label>Birthdate:</Form.Label>
                  <Form.Control className="form-picontrol" value={new Date(dob).toLocaleDateString()} disabled />
                </Form.Group>
                <Form.Group as={Col} controlId="contactNumber">
                  <Form.Label>Contact Number:</Form.Label>
                  <Form.Control className="form-picontrol" value={cnumber} disabled />
                </Form.Group>
              </Row>
              <Row>
                <Col className="text-center mt-3">
                  <Button variant="primary" onClick={handleShowInfoModal}>
                    Edit Information
                  </Button>
                  <Button variant="link" onClick={() => setShowPasswordModal(true)}>
                    Change Password
                  </Button>
                </Col>
              </Row>
            </Form>
          </Container>
        </div>
      </Container>

      {/* Render the TwoFactorAuth modal when 2FA is not enabled */}
      {showTwoFactorAuthModal && (
        <TwoFactorAuth 
          show={showTwoFactorAuthModal} 
          handleClose={() => setShowTwoFactorAuthModal(false)} 
    
        />
      )}

      {/* Modal handling */}
      <ChangePasswordModal
        show={showPasswordModal}
        handleClose={handleCloseModal}
        pid={pid}
        email={email}
        password={password}
      />
      <UpdatePatientInfoModal
        show={showInfoModal}
        handleClose={handleCloseModal}
        thePatient={thePatient}
        pid={pid}
      />
      <UpdatePatientImageModal
        show={showImageModal}
        handleClose={handleCloseModal}
        pid={pid}
        onImageUpload={handleImageUpload}
      />
    </>
  );
}

export default PatientInformation;
