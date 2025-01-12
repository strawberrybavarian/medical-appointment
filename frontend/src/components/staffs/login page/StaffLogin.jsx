// StaffLogin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button, Container, Card } from 'react-bootstrap';
import CreateStaffModal from './CreateStaffModal'; 
import AdminPasswordModal from './AdminPasswordModal'; 
import { ip } from '../../../ContentExport';

// If you want to store staff in the same context
import { useUser } from '../../UserContext';

const StaffLogin = ({hideOuterStyles}) => {
  const navigate = useNavigate();
  const { setUser, setRole } = useUser();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("Medical Secretary");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  // useEffect(() => {
  //   const checkSession = async () => {
  //     try{
  //       const response = await axios.get(`${ip.address}/api/get/session`, {withCredentials: true});
  //       if (response.data.user){
  //         const existingUser = response.data.user;
  //         const existingRole = response.data.role;
  //         console.log("Active session found. Role: ", existingRole);
  //         setUser(existingUser)
  //         setRole(existingRole)
  //         if(existingRole === 'Medical Secretary'){
  //           navigate('/medsec/dashboard')
  //         } else if (existingRole === 'Admin'){
  //           navigate('/admin/dashboard/patient')
  //         }
  //       }
  //     }catch(err){
  //       console.log("No active session or error: ", err.response?.data?.message);
  //     }
  //     console.log('No active session found. Show staff login form.')
  //   }
  //   checkSession();
  // }, [navigate, setUser, setRole]);


  const handleLogIn = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${ip.address}/api/login`,
        {
          email,
          password,
          rememberMe: false,
          role: userRole, // 'Medical Secretary' or 'Admin'
        },
        { withCredentials: true }
      );

      if (response.data.user) {
        const theUser = response.data.user;
        const theRole = response.data.role;

        setUser(theUser);
        setRole(theRole);

        if (theUser.status === "pending") {
          setSelectedUser(theUser);
          setShowModal(true);
        } else if (theUser.status === "registered") {
          window.alert("Successfully logged in!");

          if (theRole === "Medical Secretary") {
            navigate('/medsec/dashboard', {
              state: {
                userId: theUser._id,
                userName: `${theUser.firstName} ${theUser.lastName}`,
                role: theRole,
              },
            });
          } else if (theRole === "Admin") {
            navigate('/admin/dashboard/patient', {
              state: {
                userId: theUser._id,
                userName: `${theUser.firstName} ${theUser.lastName}`,
                role: theRole,
              },
            });
          }
        } else {
          setErrorMessage("Cannot log in: unknown user status.");
        }

      } else {
        setErrorMessage(response.data.message || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setErrorMessage(err.response?.data?.message || "An error occurred while logging in.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <Container className="login-container cont-fluid-no-gutter">
 {hideOuterStyles ? (
  <Row>
        <Col>
          <Form onSubmit={handleLogIn} className="p-4 pt-5 form-signin">
            <h1 className="text-center">Staff Login</h1>
            <p className="text-center text-muted mb-4">For Medical Secretary or Admin</p>

            {/* Email Field */}
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

            {/* Password Field */}
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

            {/* Role Dropdown */}
            <Form.Group controlId="formRole" className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="Medical Secretary">Medical Secretary</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Form.Group>

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100 mt-3">
              Log In
            </Button>
          </Form>
        </Col>
      </Row>
      ) : (
        // Original container + card code if we do NOT pass hideOuterStyles
        <div>Original styling here</div>
      )}

      {selectedUser && userRole === 'Medical Secretary' && (
        <CreateStaffModal
          show={showModal}
          handleClose={handleModalClose}
          user={selectedUser}
          onComplete={handleModalClose}
        />
      )}
      {selectedUser && userRole === 'Admin' && (
        <AdminPasswordModal
          show={showModal}
          handleClose={handleModalClose}
          user={selectedUser}
          onComplete={handleModalClose}
        />
      )}
    </Container>
  );
};

export default StaffLogin;
