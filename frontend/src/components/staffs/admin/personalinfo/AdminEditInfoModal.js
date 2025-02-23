import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../ContentExport';
const AdminEditInfoModal = ({ show, handleClose, adminId }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [birthdate, setBirthdate] = useState("");

    console.log(adminId)
    useEffect(() => {
        if (adminId) {
            axios.get(`${ip.address}/api/admin/${adminId}`)
                .then((res) => {
                    const { firstName, lastName, email, contactNumber, birthdate } = res.data.theAdmin;
           
                    setFirstName(firstName);
                    setLastName(lastName);
                    setEmail(email);
                    setContactNumber(contactNumber);
                    setBirthdate(birthdate);
                })
                .catch((err) => console.log("Error fetching admin info:", err));
        }
    }, [adminId]);


    console.log(firstName, lastName, email, contactNumber, birthdate);

    const handleSubmit = () => {
        const updatedInfo = { firstName, lastName, email, contactNumber, birthdate };
        
        axios.put(`${ip.address}/api/admin/update-info/${adminId}`, updatedInfo)
            .then((res) => {

                handleClose();  // Close the modal after successful update
                window.location.reload();  // Reload the page after successful update
            })
            .catch((err) => console.error("Error updating admin info:", err));
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header className='am-header' closeButton>
                <Modal.Title>Edit Admin Information</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{width: '100%'}}>
                <Form>
                    <Form.Group controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formContactNumber">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                            type="text"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBirthdate">
                        <Form.Label>Birthdate</Form.Label>
                        <Form.Control
                            type="date"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer style={{width: '100%'}}>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminEditInfoModal;
