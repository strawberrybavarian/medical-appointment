import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Button, Form, Container, Card } from "react-bootstrap";
import PasswordValidation from "./PasswordValidation";
import "./SignUp.css";
import { image, ip } from "../../ContentExport";
import ForLoginAndSignupNavbar from "../landpage/ForLoginAndSignupNavbar";
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import Select from 'react-select';

const NewSignUp = () => {
  const navigate = useNavigate();
  const [ufirstName, setFirstName] = useState("");
  const [uLastName, setLastName] = useState("");
  const [uAge, setAge] = useState(0);
  const [uMiddleInitial, setMiddleInitial] = useState("");
  const [uemail, setEmail] = useState("");
  const [uBirth, setBirth] = useState("");
  const [upassword, setPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uNumber, setNumber] = useState("");
  const [uGender, setGender] = useState("Male");
  const [accountStatus, setAccountStatus] = useState("Registered");

  // Patient-specific fields
  const [patientAddress, setPatientAddress] = useState({
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    zipCode: "",
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
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    zipCode: "",
    civilStatus: "",
  });

  const [existingEmails, setExistingEmails] = useState([]);
  const [existingContactNumbers, setExistingContactNumbers] = useState([]);

  const [showTermsModal, setShowTermsModal] = useState(false);

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]); // Ensure it's an empty array by default

  const [barangays, setBarangays] = useState([]);

  const [selectedRegionCode, setSelectedRegionCode] = useState(null);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedCityMunCode, setSelectedCityMunCode] = useState(null);

  const handleShowTermsModal = () => {
    if (validateForm()) {
      setShowTermsModal(true);
    }
  };
  const handleCloseTermsModal = () => setShowTermsModal(false);

  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    // Proceed to register the user
    registerUser();
  };

  useEffect(() => {
    // Fetch existing emails and contact numbers for validation
    const fetchData = async () => {
      try {
        const [patientResponse, patientNumberResponse] = await Promise.all([
          axios.get(`${ip.address}/api/patient/getallemails`),
          axios.get(`${ip.address}/api/patient/getcontactnumber`),
        ]);

        const validEmails = patientResponse.data.filter(
          (email) => email !== null
        );
        setExistingEmails(validEmails);

        const validContactNumbers = patientNumberResponse.data.filter(
          (number) => number !== null
        );
        setExistingContactNumbers(validContactNumbers);
      } catch (err) {
        console.error(
          "Error fetching existing emails or contact numbers:",
          err
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch Regions on component mount
    const fetchRegions = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/regions` );
        setRegions(response.data);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedRegionCode) {
      const fetchProvincesOrCities = async () => {
        try {
          const response = await axios.get(`${ip.address}/api/regions/${selectedRegionCode.value}/provinces/`);
          const provincesData = response.data;
          setProvinces(provincesData);
          setCities([]); // Reset cities
          setBarangays([]); // Reset barangays
          setSelectedProvinceCode(null); // Reset selected province
          setSelectedCityMunCode(null); // Reset selected city
  
          if (provincesData.length > 0) {
            // Region has provinces
            setPatientAddress((prevAddress) => ({
              ...prevAddress,
              region: selectedRegionCode.label,
              province: "",
              city: "",
              barangay: "",
            }));
          } else {
            // Region has no provinces (e.g., NCR), fetch cities/municipalities directly
            const citiesResponse = await axios.get(
              `${ip.address}/api/regions/${selectedRegionCode.value}/cities-municipalities/`
            );
            setCities(citiesResponse.data);
            setPatientAddress((prevAddress) => ({
              ...prevAddress,
              region: selectedRegionCode.label,
              province: "", // No province
              city: "",
              barangay: "",
            }));
          }
        } catch (error) {
          console.error("Error fetching provinces or cities:", error);
        }
      };
  
      fetchProvincesOrCities();
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      setSelectedProvinceCode(null);
      setSelectedCityMunCode(null);
      setPatientAddress((prevAddress) => ({
        ...prevAddress,
        region: "",
        province: "",
        city: "",
        barangay: "",
      }));
    }
  }, [selectedRegionCode]);

  useEffect(() => {
    if (selectedProvinceCode) {
      // Fetch cities/municipalities for the selected province
      const fetchCities = async () => {
        try {
          const response = await axios.get(
            `${ip.address}/api/regions/${selectedRegionCode.value}/cities-municipalities/`
          );
          setCities(response.data);
          setBarangays([]); // Reset barangays
          setSelectedCityMunCode(null); // Reset selected city
          setPatientAddress((prevAddress) => ({
            ...prevAddress,
            province: selectedProvinceCode.label,
            city: "",
            barangay: "",
          }));
        } catch (error) {
          console.error("Error fetching cities/municipalities:", error);
        }
      };
  
      fetchCities();
    }
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (selectedCityMunCode) {
      // Fetch barangays for the selected city/municipality
      const fetchBarangays = async () => {
        try {
          const response = await axios.get(
            `${ip.address}/api/cities-municipalities/${selectedCityMunCode.value}/barangays/`
          );
          setBarangays(response.data);
          setPatientAddress((prevAddress) => ({
            ...prevAddress,
            city: selectedCityMunCode.label,
            barangay: "",
          }));
        } catch (error) {
          console.error("Error fetching barangays:", error);
        }
      };
  
      fetchBarangays();
    } else {
      setBarangays([]);
      setPatientAddress((prevAddress) => ({
        ...prevAddress,
        city: "",
        barangay: "",
      }));
    }
  }, [selectedCityMunCode]);

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
    if (upassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!uBirth) newErrors.birth = "Birthdate is required";
    if (!uNumber || !/^09\d{9}$/.test(uNumber)) {
      newErrors.number =
        "Valid Philippine number starting with 09 and 11 digits long is required";
    } else if (existingContactNumbers.includes(uNumber)) {
      newErrors.number = "Contact number already exists";
    }
    if (!uGender) newErrors.gender = "Gender is required";

    if (!patientAddress.street) newErrors.street = "Street is required";
    if (!patientAddress.region) newErrors.region = "Region is required";
    if (provinces.length > 0 && !patientAddress.province)
      newErrors.province = "Province is required";
    if (!patientAddress.city) newErrors.city = "City/Municipality is required";
    if (!patientAddress.barangay) newErrors.barangay = "Barangay is required";
    if (!patientAddress.zipCode) newErrors.zipCode = "Zip Code is required";
    if (!patientCivilStatus) newErrors.civilStatus = "Civil Status is required";

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
          error =
            "Valid Philippine number starting with 09 and 11 digits long is required";
        } else if (existingContactNumbers.includes(value)) {
          error = "Contact number already exists";
        }
        break;
      case "gender":
        error = !value ? "Gender is required" : "";
        break;
      case "street":
        error = !value ? "Street is required" : "";
        break;
      case "region":
        error = !value ? "Region is required" : "";
        break;
      case "province":
        if (provinces.length > 0 && !value) {
          error = "Province is required";
        } else {
          error = "";
        }
        break;
      case "city":
        error = !value ? "City/Municipality is required" : "";
        break;
      case "barangay":
        error = !value ? "Barangay is required" : "";
        break;
      case "zipCode":
        error = !value ? "Zip Code is required" : "";
        break;
      case "civilStatus":
        error = !value ? "Civil Status is required" : "";
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
  };

  const handleTextInputChange = (setter) => (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setter(value);
  };

  const handleNumberInputChange = (setter) => (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setter(value);
  };

  const registerUser = () => {
    if (!validateForm()) {
      return;
    }

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

    axios
      .post(`${ip.address}/api/patient/api/signup`, patientUser)
      .then((response) => {
        window.alert("Successfully registered Patient");
        navigate("/medapp/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
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

  // Civil Status options
  const civilStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Separated", label: "Separated" },
    { value: "Widowed", label: "Widowed" },
  ];

  // Gender options
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  return (
    <>
    
      <Container
        fluid
        className="p-0 d-flex flex-column justify-content-center"
        style={{
          height: "calc(100vh)",
          overflowY: "auto",
          backgroundImage: `url(${ip.address}/images/Background-Signup.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          paddingBottom: "1.5rem",
          paddingTop: "20rem",
        }}
      >
          <ForLoginAndSignupNavbar />
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ minHeight: "100vh" }}
        >
          <Container
            className="d-flex justify-content-center align-items-center "
            style={{ minHeight: "100vh" }}
          >
            <Row className="justify-content-start mt-5">
              <Col>
                <Card
                  className="shadow p-4"
                  style={{ zIndex: 2, width: "100%", marginTop: "60rem" }}
                >
                  <Card.Body>
                    <div className="text-center">
                      <img
                        src={image.logo}
                        style={{
                          width: "15rem",
                          height: "7.5rem",
                        }}
                      />
                    </div>

                    <h4 className="text-center mb-4">Sign Up</h4>
                    <Form>
                      {/* First and Last Name */}
                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter First Name"
                            onBlur={(e) =>
                              handleBlur("firstName", e.target.value)
                            }
                            onChange={handleTextInputChange(setFirstName)}
                            value={ufirstName}
                          />
                          {errors.firstName && (
                            <Form.Text className="text-danger">
                              {errors.firstName}
                            </Form.Text>
                          )}
                        </Form.Group>

                        <Form.Group as={Col}>
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Last Name"
                            onBlur={(e) =>
                              handleBlur("lastName", e.target.value)
                            }
                            onChange={handleTextInputChange(setLastName)}
                            value={uLastName}
                          />
                          {errors.lastName && (
                            <Form.Text className="text-danger">
                              {errors.lastName}
                            </Form.Text>
                          )}
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
                            onChange={handleTextInputChange(setMiddleInitial)}
                            value={uMiddleInitial}
                          />
                        </Form.Group>

                        <Form.Group as={Col}>
                          <Form.Label>Birthdate</Form.Label>
                          <Form.Control
                            type="date"
                            onBlur={(e) => handleBlur("birth", e.target.value)}
                            onChange={(e) => setBirth(e.target.value)}
                            value={uBirth}
                          />
                          {errors.birth && (
                            <Form.Text className="text-danger">
                              {errors.birth}
                            </Form.Text>
                          )}
                        </Form.Group>

                        <Form.Group as={Col}>
                          <Form.Label>Contact Number</Form.Label>
                          <Form.Control
                            type="text"
                            maxLength={11}
                            placeholder="Enter Contact Number"
                            onBlur={(e) => handleBlur("number", e.target.value)}
                            onChange={handleNumberInputChange(setNumber)}
                            value={uNumber}
                          />
                          {errors.number && (
                            <Form.Text className="text-danger">
                              {errors.number}
                            </Form.Text>
                          )}
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
                            onChange={(e) => setEmail(e.target.value)}
                            value={uemail}
                          />
                          {errors.email && (
                            <Form.Text className="text-danger">
                              {errors.email}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>

                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Enter Password"
                            onBlur={(e) =>
                              handleBlur("password", e.target.value)
                            }
                            onChange={(e) => setPass(e.target.value)}
                            value={upassword}
                          />
                          {errors.password && (
                            <Form.Text className="text-danger">
                              {errors.password}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>

                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Confirm Password"
                            onBlur={(e) =>
                              handleBlur("confirmPassword", e.target.value)
                            }
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                          />
                          {errors.confirmPassword && (
                            <Form.Text className="text-danger">
                              {errors.confirmPassword}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>

                      <PasswordValidation password={upassword} />

                      {/* Address Fields */}
                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>Street</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Street"
                            onChange={(e) =>
                              setPatientAddress({
                                ...patientAddress,
                                street: e.target.value,
                              })
                            }
                            onBlur={(e) => handleBlur("street", e.target.value)}
                            value={patientAddress.street}
                          />
                          {errors.street && (
                            <Form.Text className="text-danger">
                              {errors.street}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>
                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>Region</Form.Label>
                          <Select
                            options={regions.map((region) => ({
                              value: region.code,
                              label: `${region.regionName}`,
                            }))}
                            onChange={(selectedOption) => {
                              setSelectedRegionCode(selectedOption);
                            }}
                            onBlur={() =>
                              handleBlur(
                                "region",
                                selectedRegionCode ? selectedRegionCode.label : ""
                              )
                            }
                            value={selectedRegionCode}
                            placeholder="Select Region"
                            isSearchable
                          />
                          {errors.region && (
                            <Form.Text className="text-danger">
                              {errors.region}
                            </Form.Text>
                          )}
                        </Form.Group>
                        {provinces.length > 0 && (
                          <Form.Group as={Col}>
                            <Form.Label>Province</Form.Label>
                            <Select
                              options={provinces.map((province) => ({
                                value: province.code,
                                label: ` ${province.name}`,
                              }))}
                              onChange={(selectedOption) => {
                                setSelectedProvinceCode(selectedOption);
                              }}
                              onBlur={() =>
                                handleBlur(
                                  "province",
                                  selectedProvinceCode
                                    ? selectedProvinceCode.label
                                    : ""
                                )
                              }
                              value={selectedProvinceCode}
                              placeholder="Select Province"
                              isSearchable
                            />
                            {errors.province && (
                              <Form.Text className="text-danger">
                                {errors.province}
                              </Form.Text>
                            )}
                          </Form.Group>
                        )}
                      </Row>
                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>City/Municipality</Form.Label>
                          <Select
                            options={Array.isArray(cities) ? cities.map((city) => ({
                              value: city.code,
                              label: ` ${city.name}`,
                            })) : []} // Only map if cities is an array
                            onChange={(selectedOption) => {
                              setSelectedCityMunCode(selectedOption);
                            }}
                            onBlur={() =>
                              handleBlur(
                                "city",
                                selectedCityMunCode ? selectedCityMunCode.label : ""
                              )
                            }
                            value={selectedCityMunCode}
                            placeholder="Select City/Municipality"
                            isSearchable
                          />

                          {errors.city && (
                            <Form.Text className="text-danger">
                              {errors.city}
                            </Form.Text>
                          )}
                        </Form.Group>
                        <Form.Group as={Col}>
                          <Form.Label>Barangay</Form.Label>
                          <Select
                            options={barangays.map((barangay) => ({
                              value: barangay.name,
                              label: ` ${barangay.name}`,
                            }))}
                            onChange={(selectedOption) => {
                              setPatientAddress((prevAddress) => ({
                                ...prevAddress,
                                barangay: selectedOption.label,
                              }));
                            }}
                            onBlur={() =>
                              handleBlur(
                                "barangay",
                                patientAddress.barangay
                              )
                            }
                            value={
                              patientAddress.barangay
                                ? { label: patientAddress.barangay }
                                : null
                            }
                            placeholder="Select Barangay"
                            isSearchable
                          />
                          {errors.barangay && (
                            <Form.Text className="text-danger">
                              {errors.barangay}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>
                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>Zip Code</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Zip Code"
                            onChange={handleNumberInputChange((value) =>
                              setPatientAddress({
                                ...patientAddress,
                                zipCode: value,
                              })
                            )}
                            onBlur={(e) => handleBlur("zipCode", e.target.value)}
                            value={patientAddress.zipCode}
                          />
                          {errors.zipCode && (
                            <Form.Text className="text-danger">
                              {errors.zipCode}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>

                      {/* Nationality and Civil Status */}
                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>Nationality</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Nationality"
                            onChange={handleTextInputChange(
                              setPatientNationality
                            )}
                            value={patientNationality}
                          />
                        </Form.Group>
                        <Form.Group as={Col}>
                          <Form.Label>Civil Status</Form.Label>
                          <Select
                            options={civilStatusOptions}
                            onChange={(selectedOption) => {
                              setPatientCivilStatus(selectedOption.value);
                            }}
                            onBlur={() =>
                              handleBlur(
                                "civilStatus",
                                patientCivilStatus
                              )
                            }
                            value={
                              patientCivilStatus
                                ? {
                                    value: patientCivilStatus,
                                    label: patientCivilStatus,
                                  }
                                : null
                            }
                            placeholder="Select Civil Status"
                            isSearchable
                          />
                          {errors.civilStatus && (
                            <Form.Text className="text-danger">
                              {errors.civilStatus}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>

                      {/* Gender */}
                      <Row className="mb-3">
                        <Form.Group as={Col}>
                          <Form.Label>Gender</Form.Label>
                          <Form.Select
                            onBlur={(e) => handleBlur("gender", e.target.value)}
                            onChange={(e) => setGender(e.target.value)}
                            value={uGender}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                          {errors.gender && (
                            <Form.Text className="text-danger">
                              {errors.gender}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Row>

                      <div className="d-lg-flex justify-content-between align-items-center mt-3">
                        <Button
                          onClick={handleShowTermsModal}
                          variant="primary"
                          type="button"
                        >
                          Submit
                        </Button>
                        <div className="mb-0">
                          <Link to="/medapp/login">
                            Already have an account?
                          </Link>
                        </div>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
                <div className="p-5" style={{ padding: "10rem" }}></div>
                <div className="p-5" style={{ padding: "1rem" }}></div>
              </Col>
            </Row>
          </Container>
        </div>
        {/* Include the Terms and Conditions Modal */}
        <TermsAndConditionsModal
          show={showTermsModal}
          handleClose={handleCloseTermsModal}
          handleAccept={handleAcceptTerms}
        />
      </Container>
    </>
  );
};

export default NewSignUp;
