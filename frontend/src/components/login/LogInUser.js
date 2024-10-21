// File: LogInUser.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button, Container, Modal, Card } from 'react-bootstrap';

import { image, ip } from '../../ContentExport';
import { usePatient } from '../patient/PatientContext';
import { useDoctor } from '../practitioner/DoctorContext';
import ForLoginAndSignupNavbar from '../landpage/ForLoginAndSignupNavbar';
import Footer from '../Footer';
import PasswordValidation from './PasswordValidation'; // Import the PasswordValidation component

const LogInUser = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("Patient");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalRole, setModalRole] = useState("Patient");
  const [modalMessage, setModalMessage] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [doctorData, setDoctorData] = useState(null); // Store doctor data locally

  const { setPatient } = usePatient();
  const { setDoctor } = useDoctor();

  const loginuser = async (e) => {
    e.preventDefault();
    if (userRole === "Patient") {
      try {
        const response = await axios.post(`${ip.address}/api/patient/api/login`, {
          email,
          password,
        });

        if (response.data.patientData) {
          const patientData = response.data.patientData;

          if (rememberMe) {
            localStorage.setItem('patient', JSON.stringify(patientData));
          } else {
            sessionStorage.setItem('patient', JSON.stringify(patientData));
          }

          setPatient(patientData); // Update context with patient data
          window.alert("Successfully logged in");

          // Navigate to homepage
          await axios.post(`${ip.address}/api/patient/session`, { userId: patientData._id, role: userRole });
          navigate('/homepage');
        } else {
          window.alert(response.data.message || "Invalid email or password. Please try again.");
        }
      } catch (err) {
        console.error('Error logging in:', err);
        window.alert(err.response?.data?.message || "An error occurred while logging in.");
      }
    } else if (userRole === "Physician") {
      try {
        const response = await axios.post(`${ip.address}/api/doctor/api/login`, {
          email,
          password,
        });

        if (response.data.doctorData) {
          const doctorDataResponse = response.data.doctorData;

          // Check if the doctor's account is under review
          if (doctorDataResponse.accountStatus === 'Review') {
            window.alert('Your account is currently under review. You cannot log in at this time.');
            return;
          }

          setDoctorData(doctorDataResponse); // Store doctor data locally

          // Check if passwordChanged is false
          if (!doctorDataResponse.passwordChanged) {
            // Show the modal to update password
            setShowPasswordModal(true);
          } else {
            // Proceed with normal login
            if (rememberMe) {
              localStorage.setItem('doctor', JSON.stringify(doctorDataResponse));
            } else {
              sessionStorage.setItem('doctor', JSON.stringify(doctorDataResponse));
            }

            setDoctor(doctorDataResponse); // Update context with doctor data
            window.alert("Successfully logged in");

            // Create a session for the doctor and navigate to the dashboard
            await axios.post(`${ip.address}/api/doctor/session`, { userId: doctorDataResponse._id, role: userRole });
            navigate('/dashboard');
          }
        } else {
          window.alert(response.data.message || "Invalid email or password. Please try again.");
        }
      } catch (err) {
        console.error('Error logging in:', err);
        window.alert(err.response?.data?.message || "An error occurred while logging in.");
      }
    }
  };

  // Function to handle password update
  const handlePasswordUpdate = async () => {
    // Validate new password
    const errors = {};
    const validations = {
      length: newPassword.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      upperCase: /[A-Z]/.test(newPassword),
      lowerCase: /[a-z]/.test(newPassword),
    };

    if (!validations.length) {
      errors.newPassword = 'Password must be at least 8 characters long.';
    }
    if (!validations.specialChar) {
      errors.newPassword = 'Password must contain at least one special character.';
    }
    if (!validations.upperCase) {
      errors.newPassword = 'Password must contain at least one uppercase letter.';
    }
    if (!validations.lowerCase) {
      errors.newPassword = 'Password must contain at least one lowercase letter.';
    }
    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match.';
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const doctorId = doctorData._id; // Get doctor ID from stored data
      await axios.put(`${ip.address}/api/doctor/update-password/${doctorId}`, { newPassword });
      window.alert('Password updated successfully');

      // After updating the password, proceed with normal login
      const updatedDoctorData = { ...doctorData, passwordChanged: true };

      if (rememberMe) {
        localStorage.setItem('doctor', JSON.stringify(updatedDoctorData));
      } else {
        sessionStorage.setItem('doctor', JSON.stringify(updatedDoctorData));
      }

      setDoctor(updatedDoctorData); // Update context with updated doctor data

      // Close the modal
      setShowPasswordModal(false);

      // Navigate to dashboard
      await axios.post(`${ip.address}/api/doctor/session`, { userId: doctorId, role: userRole });
      window.location.reload()
    } catch (err) {
      console.error('Error updating password:', err);
      window.alert(err.response?.data?.message || "An error occurred while updating the password.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (modalRole === "Patient") {
      try {
        const response = await axios.post(`${ip.address}/api/patient/forgot-password`, { email: modalEmail });
        setModalMessage(response.data.message);
        navigate('/medapp/login');
      } catch (err) {
        console.error('Error in forgot password:', err);
        setModalMessage(err.response?.data?.message || 'An error occurred.');
        navigate('/medapp/login');
      }
    } else if (modalRole === "Physician") {
      try {
        const response = await axios.post(`${ip.address}/api/doctor/forgot-password`, { email: modalEmail });
        setModalMessage(response.data.message);
        navigate('/medapp/login');
      } catch (err) {
        console.error('Error in forgot password:', err);
        setModalMessage(err.response?.data?.message || 'An error occurred.');
        navigate('/medapp/login');
      }
    }
  };

  return (
    <>
      <ForLoginAndSignupNavbar />
      <div
        className="login-background cont-fluid-no-gutter"
        style={{
          backgroundImage: `url(${ip.address}/images/Background-Login1.png)`, // Dynamically load the image URL
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 'calc(100vh-100px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowY: 'auto',
          width: '100%',
        }}
      >
        {/* Scrollable container */}
        <div style={{ width: '100%', maxHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
          <Container className="login-container cont-fluid-no-gutter">
            <Row className="justify-content-start">
              <Col md={5}>
                <Card className="shadow p-4 mt-5" style={{ marginBottom:'200px'}}>
                  <Card.Body>
                    <div className="text-center">
                      <img src={image.logo}
                        style={{
                          width: '15rem',
                          height: '7.5rem',
                        }}
                      />
                    </div>
                    <p style={{ fontWeight: '100', fontSize: '1.5rem' }} className="mb-4">Log in</p>
                    <Form onSubmit={loginuser}>
                      <Form.Group controlId="formEmail">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group controlId="formPassword" className="mt-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>Select Role</Form.Label>
                        <Form.Select
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value)}
                        >
                          <option value="Patient">Patient</option>
                          <option value="Physician">Physician</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mt-3 d-flex justify-content-between align-items-center">
                        <Form.Check
                          type="checkbox"
                          label="Remember Me"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <a href="#" onClick={() => setShowForgotPasswordModal(true)} className="text-primary">
                          Forgot Password?
                        </a>
                      </Form.Group>
                      <Button type="submit" variant="primary" className="w-100 mt-4">
                        Log In
                      </Button>
                    </Form>
                    <p className="text-center mt-3">
                      Not a member? <a href="/medapp/signup" className="text-primary">Sign up</a>
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
          <div className="footer-container" style={{paddingBottom:'5.2rem'}}>
            <Footer />
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal show={showForgotPasswordModal} onHide={() => setShowForgotPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMessage ? (
            <p>{modalMessage}</p>
          ) : (
            <Form onSubmit={handleForgotPassword}>
              <Form.Group controlId="formModalEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email Address"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formModalRole" className="mt-3">
                <Form.Label>Select Role</Form.Label>
                <Form.Select
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                >
                  <option value="Patient">Patient</option>
                  <option value="Physician">Physician</option>
                </Form.Select>
              </Form.Group>
              <Button type="submit" variant="primary" className="mt-3">
                Submit
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Password Update Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header>
          <Modal.Title>Update Your Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNewPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {passwordErrors.newPassword && <Form.Text className="text-danger">{passwordErrors.newPassword}</Form.Text>}
            </Form.Group>
            <Form.Group controlId="formConfirmNewPassword" className="mt-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              {passwordErrors.confirmNewPassword && <Form.Text className="text-danger">{passwordErrors.confirmNewPassword}</Form.Text>}
            </Form.Group>

            {/* Include PasswordValidation component */}
            <PasswordValidation password={newPassword} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordUpdate}>
            Update Password
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LogInUser;
