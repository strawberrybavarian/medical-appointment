// UserLogin.jsx
// (This is basically your existing "LogInUser" code, unchanged except for the file name)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button, Container, Modal, Card } from 'react-bootstrap';
import { image, ip } from '../../ContentExport';
import PasswordValidation from './PasswordValidation'; 
import { useUser } from '../UserContext';
import Swal from 'sweetalert2';
const LogInUser = ({hideOuterStyles }) => {
  const navigate = useNavigate();
  const { setUser, setRole } = useUser();

  // ... all your existing states
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
  const [doctorData, setDoctorData] = useState(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/get/session`, { withCredentials: true });
        if (response.data.user) {
          const existingUser = response.data.user; 
          const existingRole = response.data.role;
          console.log("Active session found. Role:", existingRole);
          setUser(existingUser);
          setRole(existingRole);

          if (existingRole === 'Patient') {
            navigate('/homepage');
          } else if (existingRole === 'Physician') {
            navigate('/dashboard');
          }
          return; 
        }
      } catch (err) {
        console.log("No active session or error:", err.response?.data?.message);
      }
      console.log("No active session found. Show user login form.");
    };
    checkSession();
  }, [navigate, setUser, setRole]);

  // login
  const loginuser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${ip.address}/api/login`,
        { email, password, rememberMe, role: userRole },
        { withCredentials: true }
      );
      if (response.data.user) {
        const loggedInUser = response.data.user; 
        const role = response.data.role;
        setUser(loggedInUser);
        setRole(role);
        

        if (role === 'Physician') {
          if (loggedInUser.passwordChanged === false) {
            setDoctorData(loggedInUser);
            setShowPasswordModal(true);
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Successfully logged in',
              showConfirmButton: true,
              timer: 1500,
            });

            navigate('/dashboard');
          }
        } else {

          //Patient
          Swal.fire({
            icon: 'success',
            toast: true,
            position: 'top-end',

            title: 'Successfully logged in',
            showConfirmButton: false,
            timer: 1500,
          });
          navigate('/homepage');
        }
      } else {
        console.log('Error logging in:', response.data.message);
        window.alert(response.data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error('Error logging in:', err);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.response?.data?.message || 'An error occurred while logging in.',
      })
    }
  };

  // handle password update for doctor
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
      const updatedDoctorData = { ...doctorData, passwordChanged: true };
      setDoctorData(updatedDoctorData);
      setShowPasswordModal(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating password:', err);
      window.alert(err.response?.data?.message || "An error occurred while updating the password.");
    }
  };

  // forgot password
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

  return (
    <>
      {hideOuterStyles ? (
        // In the slider, we'll just return a <form> that replicates your fields:
        <Row>
        <Col>
          <Form onSubmit={loginuser} className=" user-signin-container">
             
            <h1 className="">User Login</h1>

            <p className="text-muted" >
              For Patient or Physician
            </p>

            {/* Email field */}
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
              />
            </Form.Group>

            {/* Password field */}
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* Role dropdown */}
            <Form.Group controlId="formRole" className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="Patient">Patient</option>
                <option value="Physician">Physician</option>
              </Form.Select>
            </Form.Group>

            {/* Remember Me Checkbox */}


            {/* Forgot Password Link */}
            <div className="mb-3">
              <a
                href="#"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-primary"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100">
              Log In
            </Button>

            {/* Sign-up Link */}
            <p className="text-center text-muted mt-3">
              Not a member? <a href="/medapp/signup" style={{color: '#0d6efd'}}>Sign up</a>
            </p>
          </Form>
        </Col>
      </Row>
      ) : (
        // Original container + card code if we do NOT pass hideOuterStyles
        // ...
        <div>Original styling here</div>
      )}

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

      {/* Password Update Modal (for Physician if passwordChanged == false) */}
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
