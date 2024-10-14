import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button, Container, Modal, Card } from 'react-bootstrap';
import './LogIn.css'; // Optional: Add custom styles here
import { image, ip } from '../../ContentExport';
import { usePatient } from '../patient/PatientContext';
import { useDoctor } from '../practitioner/DoctorContext';
import ForLoginAndSignupNavbar from '../landpage/ForLoginAndSignupNavbar';

const LogInUser = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("Patient");
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalRole, setModalRole] = useState("Patient");
  const [modalMessage, setModalMessage] = useState("");

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
        // Alert the actual error message returned from the server
        window.alert(err.response?.data?.message || "An error occurred while logging in.");
      }
    } else if (userRole === "Physician") {
      try {
        const response = await axios.post(`${ip.address}/api/doctor/api/login`, {
          email,
          password,
        });
  
        if (response.data.doctorData) {
          const doctorData = response.data.doctorData;
  
          // Check if the doctor's account is under review
          if (doctorData.accountStatus === 'Review') {
            window.alert('Your account is currently under review. You cannot log in at this time.');
            return;
          }
  
          if (rememberMe) {
            localStorage.setItem('doctor', JSON.stringify(doctorData));
          } else {
            sessionStorage.setItem('doctor', JSON.stringify(doctorData));
          }
  
          setDoctor(doctorData); // Update context with doctor data
          window.alert("Successfully logged in");
  
          // Create a session for the doctor and navigate to the dashboard
          await axios.post(`${ip.address}/api/doctor/session`, { userId: doctorData._id, role: userRole });
          navigate('/dashboard');
        } else {
          window.alert(response.data.message || "Invalid email or password. Please try again.");
        }
      } catch (err) {
        console.error('Error logging in:', err);
        // Alert the actual error message returned from the server
        window.alert(err.response?.data?.message || "An error occurred while logging in.");
      }
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
      <ForLoginAndSignupNavbar/>
      <div
        className="login-background"
        style={{
          backgroundImage: `url(${ip.address}/images/Background-Login1.png)`, // Dynamically load the image URL
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="login-background">


        <div className="login-overlay"></div>
        <div className="login-page">
            <Container className=''>
            <Row className="justify-content-start">
                <Col md={9} lg={5}>
                <Card className="shadow p-4">
                    <Card.Body>
                    <div className="text-center">
                        <img src={image.logo}
                            style={{ 
                                width: '15rem',
                                height: '7.5rem', 


                            }}
                        />
                        
                    </div>
                    <p style={{fontWeight:'100', fontSize:'1.5rem'}} className="mb-4">Log in</p>
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
                        <a href="#" onClick={() => setShowModal(true)} className="text-primary">
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
        </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
    </>
  );
};

export default LogInUser;
