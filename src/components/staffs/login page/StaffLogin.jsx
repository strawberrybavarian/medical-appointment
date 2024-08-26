import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button, Container } from 'react-bootstrap';
import { ip } from '../../../ContentExport';

const StaffLogIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState([]);
    const [userRole, setUserRole] = useState("Medical Secretary");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;
                if (userRole === "Medical Secretary") {
                    response = await axios.get(`${ip.address}/medicalsecretary/api/allmedicalsecretary`);
                } else if (userRole === "Cashier") {
                    response = await axios.get(`${ip.address}/cashier/api/allcashier`);
                } else if (userRole === "Admin") {
                    response = await axios.get(`${ip.address}/admin/api/alladmin`);
                }

                if (response && response.data) {
                    const userData = response.data.theMedicalSecretary || response.data.theCashier || response.data.theAdmin
                    setUsers(userData);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, [userRole]);

    const handleLogIn = async (e) => {
        e.preventDefault();

        // Find the user based on the role and username
        const user = users.find(user => 
            (userRole === "Medical Secretary" && user.ms_username === username) ||
            (userRole === "Cashier" && user.cs_username === username) ||
            (userRole === "Admin" && user.username === username)
        );

        // Validate the password
        if (user && (
            (userRole === "Medical Secretary" && user.ms_password === password) || 
            (userRole === "Cashier" && user.cs_password === password) ||
            (userRole === "Admin" && user.password === password)
        )) {
            const userId = user._id;
            window.alert("Successfully logged in");

            // Redirect to respective dashboard based on the role
            navigate(userRole === 'Medical Secretary' 
                ? `/medsec/${userId}` 
                : userRole === 'Cashier' 
                ? `/cashier/${userId}` 
                : userRole === 'Admin' 
                ? `/admin/dashboard/${userId}` 
                : `/staffs`);
        } else {
            setErrorMessage("Invalid username or password. Please try again.");
        }
    };

    return (
        <>
            <div className="align-items-center d-flex vh-100">
                <Container fluid className="maincontainer d-flex justify-content-center align-items-center">
                    <div className="container">
                        <h1>Staff Login</h1>
                        <Form onSubmit={handleLogIn}>
                            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                            <Row className="mb-3">
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="align-items right">
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formChoose">
                                    <Form.Label>Choose Role:</Form.Label>
                                    <Form.Select value={userRole} onChange={(e) => setUserRole(e.target.value)} defaultValue="Medical Secretary">
                                        <option value="Medical Secretary">Medical Secretary</option>
                                        <option value="Cashier">Cashier</option>
                                        <option value="Pharmacist">Pharmacist</option>
                                        <option value="Admin">Admin</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>
                            <div className="justify-content-center mt-4">
                                <Button type="submit" className="mb-2 buttonStyle">
                                    Log In
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default StaffLogIn;
