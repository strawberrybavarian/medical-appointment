import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Button, Form, Container, Card } from "react-bootstrap";
import PasswordValidation from "./PasswordValidation";
import "./SignUp.css";
import { image, ip } from "../../ContentExport";
import Footer from "../Footer";
import ForLoginAndSignupNavbar from "../landpage/ForLoginAndSignupNavbar";

const NewSignUp = () => {
    const navigate = useNavigate();
    const [ufirstName, setfirstName] = useState("");
    const [uLastName, setLastName] = useState("");
    const [uAge, setAge] = useState(0);
    const [uMiddleInitial, setMiddleInitial] = useState("");
    const [uemail, setemail] = useState("");
    const [uBirth, setBirth] = useState("");
    const [upassword, setPass] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [uNumber, setNumber] = useState("");
    const [uGender, setGender] = useState("Male");
    const [urole, setURole] = useState("Patient");
    const [accountStatus, setAccountStatus] = useState('Registered');

    // Practitioner-specific fields
    const [dr_licenseNo, setLicenseNo] = useState("");

    // Patient-specific fields
    const [patientAddress, setPatientAddress] = useState({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
    });
    const [patientNationality, setPatientNationality] = useState("");
    const [patientCivilStatus, setPatientCivilStatus] = useState("");

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        birth: "",
        number: "",
        gender: "",
        role: "",
    });

    const [existingEmails, setExistingEmails] = useState([]);
    const [existingContactNumbers, setExistingContactNumbers] = useState([]);

    useEffect(() => {
        // Fetch all existing emails and contact numbers for validation
        const fetchData = async () => {
            try {
                const [patientResponse, doctorResponse, patientNumberResponse, doctorNumberResponse] = await Promise.all([
                    axios.get(`${ip.address}/api/patient/getallemails`),
                    axios.get(`${ip.address}/api/doctors/getallemails`),
                    axios.get(`${ip.address}/api/patient/getcontactnumber`),
                    axios.get(`${ip.address}/api/doctors/getcontactnumbers`)
                ]);

                const validEmails = [...patientResponse.data, ...doctorResponse.data].filter(email => email !== null);
                setExistingEmails(validEmails);

                const validContactNumbers = [...patientNumberResponse.data, ...doctorNumberResponse.data].filter(number => number !== null);
                setExistingContactNumbers(validContactNumbers);
            } catch (err) {
                console.error("Error fetching existing emails or contact numbers:", err);
            }
        };
        fetchData();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!ufirstName) newErrors.firstName = "First Name is required";
        if (!uLastName) newErrors.lastName = "Last Name is required";
        if (!uemail || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(uemail)) {
            newErrors.email = "Valid Email is required";
        } else if (existingEmails.includes(uemail)) {
            newErrors.email = "Email already exists";
        }
        if (!upassword) newErrors.password = "Password is required";
        if (upassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (!uBirth) newErrors.birth = "Birthdate is required";
        if (!uNumber || !/^09\d{9}$/.test(uNumber)) {
            newErrors.number = "Valid Philippine number starting with 09 and 11 digits long is required";
        } else if (existingContactNumbers.includes(uNumber)) {
            newErrors.number = "Contact number already exists";
        }
        if (!uGender) newErrors.gender = "Gender is required";
        if (!urole) newErrors.role = "Role is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field, value) => {
        let error = "";
        switch (field) {
            case "firstName":
                error = !value ? "First Name is required" : "";
                break;
            case "lastName":
                error = !value ? "Last Name is required" : "";
                break;
            case "email":
                if (!value || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
                    error = "Valid Email is required";
                } else if (existingEmails.includes(value)) {
                    error = "Email already exists";
                }
                break;
            case "password":
                error = !value ? "Password is required" : "";
                break;
            case "confirmPassword":
                error = value !== upassword ? "Passwords do not match" : "";
                break;
            case "birth":
                error = !value ? "Birthdate is required" : "";
                break;
            case "number":
                if (!value || !/^09\d{9}$/.test(value)) {
                    error = "Valid Philippine number starting with 09 and 11 digits long is required";
                } else if (existingContactNumbers.includes(value)) {
                    error = "Contact number already exists";
                }
                break;
            case "gender":
                error = !value ? "Gender is required" : "";
                break;
            case "role":
                error = !value ? "Role is required" : "";
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    };

    const registerUser = () => {
        if (!validateForm()) {
            return;
        }

        if (urole === "Practitioner") {
            const doctorUser = {
                dr_firstName: ufirstName,
                dr_lastName: uLastName,
                dr_middleInitial: uMiddleInitial,
                dr_email: uemail,
                dr_password: upassword,
                dr_dob: uBirth,
                dr_age: uAge,
                dr_contactNumber: uNumber,
                dr_gender: uGender,
                dr_licenseNo: dr_licenseNo,
            };
            axios.post(`${ip.address}/api/doctor/api/signup`, doctorUser)
                .then((response) => {
                    window.alert("Successfully registered Practitioner");
                    navigate('/medapp/login');
                })
                .catch((err) => {
                    console.log(err);
                });
        } else if (urole === "Patient") {
            const patientUser = {
                patient_firstName: ufirstName,
                patient_middleInitial: uMiddleInitial,
                patient_lastName: uLastName,
                patient_email: uemail,
                patient_password: upassword,
                patient_dob: uBirth,
                patient_age: uAge,
                patient_contactNumber: uNumber,
                patient_gender: uGender,
                accountStatus: accountStatus,
                patient_address: patientAddress,
                patient_nationality: patientNationality,
                patient_civilstatus: patientCivilStatus,
            };

            axios.post(`${ip.address}/api/patient/api/signup`, patientUser)
                .then((response) => {
                    window.alert("Successfully registered Patient");
                    navigate('/medapp/login');
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        if (uBirth) {
            const age = calculateAge(uBirth);
            setAge(age);
        }
    }, [uBirth]);

    return (
        <>
           <ForLoginAndSignupNavbar />
           <Container
                fluid
                className="p-0 d-flex flex-column justify-content-center"
                style={{
                    height: 'calc(100vh - 10px)',
                    overflowY: 'auto',
                    backgroundImage: `url(${ip.address}/images/Background-Signup.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%', paddingBottom: '1.5rem',
                    paddingTop:'5rem'
                }}
            >
                <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '100vh', }}>
                    <Container className="d-flex justify-content-center align-items-center " style={{ minHeight: '100vh',  }}>
                        <Row className="justify-content-start">
                            <Col>
                                <Card className="shadow p-4" style={{ zIndex: 2, width:'100%', marginTop: '40rem'}}>
                                    <Card.Body>
                                    <div className="text-center">
                                        <img src={image.logo}
                                                style={{ 
                                                    width: '15rem',
                                                    height: '7.5rem', 
                                                }}
                                            />
                                    </div>
                                       
                                        <h4 className="text-center mb-4">Sign Up</h4>
                                        <Form>
                                            <Form.Group controlId="formChoose" className="mb-3">
                                                <Form.Label>Choose what to register:</Form.Label>
                                                <Form.Select
                                                    onBlur={(e) => handleBlur("role", e.target.value)}
                                                    onChange={(e) => setURole(e.target.value)}
                                                    defaultValue="Patient"
                                                >
                                                    <option value="Patient">Patient</option>
                                                    <option value="Practitioner">Practitioner</option>
                                                </Form.Select>
                                            </Form.Group>

                                            {/* First and Last Name */}
                                            <Row className="mb-3">
                                                <Form.Group as={Col}>
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter First Name"
                                                        onBlur={(e) => handleBlur("firstName", e.target.value)}
                                                        onChange={(e) => setfirstName(e.target.value)}
                                                    />
                                                    {errors.firstName && <Form.Text className="text-danger">{errors.firstName}</Form.Text>}
                                                </Form.Group>

                                                <Form.Group as={Col}>
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter Last Name"
                                                        onBlur={(e) => handleBlur("lastName", e.target.value)}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                    />
                                                    {errors.lastName && <Form.Text className="text-danger">{errors.lastName}</Form.Text>}
                                                </Form.Group>
                                            </Row>

                                            {/* Middle Initial, Birthdate, and Contact */}
                                            <Row className="mb-3">
                                                <Form.Group as={Col}>
                                                    <Form.Label>Middle Initial</Form.Label>
                                                    <Form.Control
                                                        maxLength={1}
                                                        type="text"
                                                        placeholder="Enter Middle Initial"
                                                        onChange={(e) => setMiddleInitial(e.target.value)}
                                                    />
                                                </Form.Group>

                                                <Form.Group as={Col}>
                                                    <Form.Label>Birthdate</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        onBlur={(e) => handleBlur("birth", e.target.value)}
                                                        onChange={(e) => setBirth(e.target.value)}
                                                    />
                                                    {errors.birth && <Form.Text className="text-danger">{errors.birth}</Form.Text>}
                                                </Form.Group>

                                                <Form.Group as={Col}>
                                                    <Form.Label>Contact Number</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        maxLength={11}
                                                        placeholder="Enter Contact Number"
                                                        onBlur={(e) => handleBlur("number", e.target.value)}
                                                        onChange={(e) => setNumber(e.target.value)}
                                                    />
                                                    {errors.number && <Form.Text className="text-danger">{errors.number}</Form.Text>}
                                                </Form.Group>
                                            </Row>

                                            {/* Email and Password */}
                                            <Row className="mb-3">
                                                <Form.Group as={Col}>
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Enter Email"
                                                        onBlur={(e) => handleBlur("email", e.target.value)}
                                                        onChange={(e) => setemail(e.target.value)}
                                                    />
                                                    {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                <Form.Group as={Col}>
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Enter Password"
                                                        onBlur={(e) => handleBlur("password", e.target.value)}
                                                        onChange={(e) => setPass(e.target.value)}
                                                    />
                                                    {errors.password && <Form.Text className="text-danger">{errors.password}</Form.Text>}
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                <Form.Group as={Col}>
                                                    <Form.Label>Confirm Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                    {errors.confirmPassword && <Form.Text className="text-danger">{errors.confirmPassword}</Form.Text>}
                                                </Form.Group>
                                            </Row>

                                            <PasswordValidation password={upassword} />

                                            {/* Patient-Specific Fields */}
                                            {urole === "Patient" && (
                                                <>
                                                    <Row className="mb-3">
                                                        <Form.Group as={Col}>
                                                            <Form.Label>Street</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Enter Street"
                                                                onChange={(e) => setPatientAddress({ ...patientAddress, street: e.target.value })}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group as={Col}>
                                                            <Form.Label>City</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Enter City"
                                                                onChange={(e) => setPatientAddress({ ...patientAddress, city: e.target.value })}
                                                            />
                                                        </Form.Group>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Form.Group as={Col}>
                                                            <Form.Label>Nationality</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Enter Nationality"
                                                                onChange={(e) => setPatientNationality(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group as={Col}>
                                                            <Form.Label>Civil Status</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Enter Civil Status"
                                                                onChange={(e) => setPatientCivilStatus(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                    </Row>
                                                </>
                                            )}

                                            {/* Practitioner-Specific Fields */}
                                            {urole === "Practitioner" && (
                                                <Row className="mb-3">
                                                    <Form.Group as={Col}>
                                                        <Form.Label>License Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter License Number"
                                                            onChange={(e) => setLicenseNo(e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Row>
                                            )}

                                            {/* Gender */}
                                            <Row className="mb-3">
                                                <Form.Group as={Col}>
                                                    <Form.Label>Gender</Form.Label>
                                                    <Form.Select
                                                        onBlur={(e) => handleBlur("gender", e.target.value)}
                                                        onChange={(e) => setGender(e.target.value)}
                                                    >
                                                        <option value="" disabled>Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </Form.Select>
                                                    {errors.gender && <Form.Text className="text-danger">{errors.gender}</Form.Text>}
                                                </Form.Group>
                                            </Row>

                                            <div className="d-lg-flex justify-content-between align-items-center mt-3">
                                                <Button onClick={registerUser} variant="primary" type="button">
                                                    Submit
                                                </Button>
                                                <div className="mb-0">
                                                    <Link to="/medapp/login">Already have an account?</Link>
                                                </div>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                                <div className="p-5" style={{padding:'10rem'}}></div>
                                <div className="p-5" style={{padding:'1rem'}}></div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </Container>
        </>
    );
};

export default NewSignUp;
