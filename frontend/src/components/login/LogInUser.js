import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button, Container, Modal, Card } from 'react-bootstrap';
import { image, ip } from '../../ContentExport';
import ForLoginAndSignupNavbar from '../landpage/ForLoginAndSignupNavbar';
import Footer from '../Footer';
import PasswordValidation from './PasswordValidation'; // Import the PasswordValidation component

// ***** IMPORT OUR UNIFIED CONTEXT *****
import { useUser } from '../UserContext';

const LogInUser = () => {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("Patient");
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot Password Modal states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalRole, setModalRole] = useState("Patient");
  const [modalMessage, setModalMessage] = useState("");

  // Password Update Modal states (for doctors)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [doctorData, setDoctorData] = useState(null); // store doc data if password not changed

  // ***** UNIFIED CONTEXT *****
  const { setUser, setRole } = useUser();

  // ----------------------------------------------------------------
  // 1. Check if there's an active session on mount
  //    We'll call /api/get/session once. If user is found:
  //    if role === 'Patient' => /homepage
  //    if role === 'Physician' => /dashboard
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/get/session`, {
          withCredentials: true,
        });

        if (response.data.user) {
          const existingUser = response.data.user; 
          const existingRole = response.data.role;

          console.log("Active session found. Role:", existingRole);

          // Save to context
          setUser(existingUser);
          setRole(existingRole);

          // Navigate based on role
          if (existingRole === 'Patient') {
            console.log("Redirecting to /homepage (patient).");
            navigate('/homepage');
          } else if (existingRole === 'Physician') {
            console.log("Redirecting to /dashboard (physician).");
            navigate('/dashboard');
          }
          return; 
        }
      } catch (err) {
        console.log("No active session found or error checking session:", err.response?.data?.message);
      }

      // If we reach here, no session => show the login form
      console.log("No active session found. Displaying login form.");
    };

    checkSession();
  }, [navigate, setUser, setRole]);

  // ----------------------------------------------------------------
  // 2. Handle Login with single /api/login
  //    Body: { email, password, rememberMe, role: userRole }
  //    If role= 'Physician' => check passwordChanged
  //    If role= 'Patient' => go /homepage
  // ----------------------------------------------------------------
  const loginuser = async (e) => {
    e.preventDefault();

    try {
      // Single login endpoint
      const response = await axios.post(
        `${ip.address}/api/login`,
        { email, password, rememberMe, role: userRole },
        { withCredentials: true }
      );

      if (response.data.user) {
        const loggedInUser = response.data.user; 
        const role = response.data.role; // 'Physician' or 'Patient'

        // Save to our unified context
        setUser(loggedInUser);
        setRole(role);

        window.alert("Successfully logged in");

        // If physician, check if password changed
        if (role === 'Physician') {
          // Suppose the server sets "passwordChanged" in user
          if (loggedInUser.passwordChanged === false) {
            // Show password modal
            setDoctorData(loggedInUser);
            setShowPasswordModal(true);
          } else {
            // Normal doc login
            navigate('/dashboard');
          }
        } else {
          // Patient => homepage
          navigate('/homepage');
        }
      } else {
        window.alert(response.data.message || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error('Error logging in:', err);
      window.alert(err.response?.data?.message || "An error occurred while logging in.");
    }
  };

  // ----------------------------------------------------------------
  // 3. Handle Doctor Password Update
  // ----------------------------------------------------------------
  const handlePasswordUpdate = async () => {
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
    if (Object.keys(errors).length > 0) return;

    try {
      const doctorId = doctorData._id; 
      await axios.put(`${ip.address}/api/doctor/update-password/${doctorId}`, { newPassword });
      window.alert('Password updated successfully');

      // Mark password changed
      const updatedDoctorData = { ...doctorData, passwordChanged: true };
      setDoctorData(updatedDoctorData);

      // Possibly setUser(updatedDoctorData) in the context
      // to reflect the updated user. 
      // Or do a session refresh. 
      // We'll do a quick approach:
      setShowPasswordModal(false);

      // After password update, navigate doc => /dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating password:', err);
      window.alert(err.response?.data?.message || "An error occurred while updating the password.");
    }
  };

  // ----------------------------------------------------------------
  // 4. Handle Forgot Password (still separate endpoints if you want)
  // ----------------------------------------------------------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const endpoint = (modalRole === "Patient")
        ? `/api/patient/forgot-password`
        : `/api/doctor/forgot-password`;

      const response = await axios.post(`${ip.address}${endpoint}`, { email: modalEmail });
      setModalMessage(response.data.message);
      navigate('/medapp/login');
    } catch (err) {
      console.error('Error in forgot password:', err);
      setModalMessage(err.response?.data?.message || 'An error occurred.');
      navigate('/medapp/login');
    }
  };

  // ----------------------------------------------------------------
  // 5. Render the Login UI (unchanged)
  // ----------------------------------------------------------------
  return (
    <>
      <ForLoginAndSignupNavbar />
      <Container
        fluid
        className="login-background cont-fluid-no-gutter"
        style={{
          backgroundImage: `url(${ip.address}/images/Background-Login1.png)`,
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
        <div
          style={{
            width: '100%',
            maxHeight: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}
        >
          <Container className="login-container cont-fluid-no-gutter">
            <Row className="justify-content-start">
              <Col md={5}>
                <Card className="shadow p-4 mt-5" style={{ marginBottom: '200px' }}>
                  <Card.Body>
                    <div className="text-center">
                      <img
                        src={image.logo}
                        style={{ width: '15rem', height: '7.5rem' }}
                        alt="Logo"
                      />
                    </div>
                    <p style={{ fontWeight: '100', fontSize: '1.5rem' }} className="mb-4">
                      Log in
                    </p>
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
                        <a
                          href="#"
                          onClick={() => setShowForgotPasswordModal(true)}
                          className="text-primary"
                        >
                          Forgot Password?
                        </a>
                      </Form.Group>
                      <Button type="submit" variant="primary" className="w-100 mt-4">
                        Log In
                      </Button>
                    </Form>
                    <p className="text-center mt-3">
                      Not a member?{' '}
                      <a href="/medapp/signup" className="text-primary">
                        Sign up
                      </a>
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
          <div className="footer-container" style={{ paddingBottom: '4.6rem' }}>
            <Footer />
          </div>
        </div>
      </Container>

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
              {passwordErrors.newPassword && (
                <Form.Text className="text-danger">{passwordErrors.newPassword}</Form.Text>
              )}
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
              {passwordErrors.confirmNewPassword && (
                <Form.Text className="text-danger">{passwordErrors.confirmNewPassword}</Form.Text>
              )}
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
