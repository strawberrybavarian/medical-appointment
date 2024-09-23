import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Container, Button } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import ChangePasswordModal from './ChangePasswordModal';  // Import the Change Password Modal
import UpdatePatientInfoModal from './UpdatePatientInfoModal';  // Import the Update Information Modal
import './PatientInformation.css';

function PatientInformation() {
    const { pid } = useParams();
    const navigate = useNavigate();

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
    const [lastProfileUpdate, setLastProfileUpdate] = useState(null);

    // Function to mask email
    const maskEmail = (email) => {
      if (!email || !email.includes("@")) {
        return email;  // Return the original email if no '@' symbol
      }
    
      const [namePart, domainPart] = email.split("@");
      const maskedName = namePart[0] + "****" + namePart[namePart.length - 1];
      const domainParts = domainPart.split(".");
      const maskedDomain =
        domainParts[0][0] + "***" + domainParts[0][domainParts[0].length - 1];
      const topLevelDomain =  domainParts[1];
    
      return `${maskedName}@${maskedDomain}.${topLevelDomain}`;
    };

    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
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
                setLastProfileUpdate(new Date(patientData.lastProfileUpdate));  // Use lastProfileUpdate instead of updatedAt
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pid]);

    // Check if 30 days have passed since the last profile update
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
    };

    return (
        <>
            <div style={{ width: '100%', height: '100vh' }}>
                <Container className="mt-4">
                    <div className="pi-container2">
                        <div className="p-3">
                            <h3 className="m-0">Account Details</h3>
                            <p className="m-0">Manage your Profile</p>
                            <hr />
                        </div>
                        <Container>
                            <Form>
                                <div className="justify-content-end">
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
                                            {/* Button to open update modal */}
                                            <Button variant="primary" onClick={handleShowInfoModal}>
                                                Edit Information
                                            </Button>
                                            {/* Change Password link */}
                                            <Button variant="link" onClick={() => setShowPasswordModal(true)}>
                                                Change Password
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Form>
                        </Container>
                    </div>
                </Container>
            </div>

            {/* Render the ChangePasswordModal component */}
            <ChangePasswordModal
                show={showPasswordModal}
                handleClose={handleCloseModal}
                pid={pid}
                email={email}
                password={password}
            />

            {/* Render the UpdateInfoModal component */}
            <UpdatePatientInfoModal
                show={showInfoModal}
                handleClose={handleCloseModal}
                thePatient={thePatient}
                pid={pid}
            />
        </>
    );
}

export default PatientInformation;
