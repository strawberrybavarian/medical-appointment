import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Image, Card } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import CropResizeTiltModal from '../../../../../patient/patientinformation/PatientInformation/CropResizeTiltModal';
import { ip } from '../../../../../../ContentExport';

const CreatePatientForms = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State variables - no password fields
  const [patient_firstName, setFirstName] = useState('');
  const [patient_lastName, setLastName] = useState('');
  const [patient_middleInitial, setMiddleInitial] = useState('');
  const [patient_email, setEmail] = useState('');
  const [patient_dob, setDob] = useState('');
  const [patient_age, setAge] = useState(0);
  const [patient_cnumber, setCnumber] = useState('');
  const [patient_gender, setGender] = useState('');
  const [accountStatus, setAccountStatus] = useState('Unregistered'); // Set as Unregistered
  const [patient_nationality, setPatientNationality] = useState('');
  const [patient_civilstatus, setPatientCivilStatus] = useState('');
  
  // Address state
  const [patient_address, setPatientAddress] = useState({
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    zipCode: "",
  });

  // Location dropdown states
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState(null);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedCityMunCode, setSelectedCityMunCode] = useState(null);

  // UI states
  const [patient_image, setPatientImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [stream, setStream] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [existingEmails, setExistingEmails] = useState([]);
  const [existingContactNumbers, setExistingContactNumbers] = useState([]);

  // Civil Status options
  const civilStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Separated", label: "Separated" },
    { value: "Widowed", label: "Widowed" },
  ];

  // Fetch existing emails and contact numbers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientEmailResponse, patientNumberResponse] = await Promise.all([
          axios.get(`${ip.address}/api/patient/getallemails`),
          axios.get(`${ip.address}/api/patient/getcontactnumber`),
        ]);

        const validEmails = patientEmailResponse.data.filter(email => email !== null);
        setExistingEmails(validEmails);

        const validContactNumbers = patientNumberResponse.data.filter(number => number !== null);
        setExistingContactNumbers(validContactNumbers);
      } catch (err) {
        console.error('Error fetching existing emails or contact numbers:', err);
      }
    };

    fetchData();
  }, []);

  // Fetch Regions when component mounts
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/regions`);
        setRegions(response.data);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegions();
  }, []);

  // Fetch Provinces or Cities based on selected Region
  useEffect(() => {
    if (selectedRegionCode) {
      const fetchProvincesOrCities = async () => {
        try {
          const response = await axios.get(`${ip.address}/api/regions/${selectedRegionCode.value}/provinces/`);
          const provincesData = response.data;
          setProvinces(provincesData);
          setCities([]);
          setBarangays([]);
          setSelectedProvinceCode(null);
          setSelectedCityMunCode(null);
  
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

  // Fetch Cities based on selected Province
  useEffect(() => {
    if (selectedProvinceCode) {
      const fetchCities = async () => {
        try {
          const response = await axios.get(
            `${ip.address}/api/regions/${selectedRegionCode.value}/cities-municipalities/`
          );
          setCities(response.data);
          setBarangays([]);
          setSelectedCityMunCode(null);
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

  // Fetch Barangays based on selected City
  useEffect(() => {
    if (selectedCityMunCode) {
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

  // Calculate age when DOB changes
  useEffect(() => {
    if (patient_dob) {
      const birthDate = new Date(patient_dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      setAge(age);
    }
  }, [patient_dob]);

  // Validation function
  const validate = () => {
    let tempErrors = {};

    tempErrors.firstName = patient_firstName ? '' : 'First name is required.';
    tempErrors.lastName = patient_lastName ? '' : 'Last name is required.';
    
    if (!patient_email) {
      tempErrors.email = 'Email is required.';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(patient_email)) {
      tempErrors.email = 'Invalid email format.';
    } else if (existingEmails.includes(patient_email)) {
      tempErrors.email = 'Email already exists.';
    }
    
    tempErrors.dob = patient_dob ? '' : 'Date of birth is required.';
    
    if (!patient_cnumber) {
      tempErrors.number = 'Contact number is required.';
    } else if (!/^09\d{9}$/.test(patient_cnumber)) {
      tempErrors.number = 'Valid Philippine number starting with 09 and 11 digits long is required.';
    } else if (existingContactNumbers.includes(patient_cnumber)) {
      tempErrors.number = 'Contact number already exists.';
    }
    
    tempErrors.gender = patient_gender ? '' : 'Gender is required.';
    tempErrors.street = patient_address.street ? '' : 'Street is required.';
    tempErrors.region = patient_address.region ? '' : 'Region is required.';
    
    if (provinces.length > 0 && !patient_address.province) {
      tempErrors.province = 'Province is required.';
    }
    
    tempErrors.city = patient_address.city ? '' : 'City/Municipality is required.';
    tempErrors.barangay = patient_address.barangay ? '' : 'Barangay is required.';
    tempErrors.zipCode = patient_address.zipCode ? '' : 'Zip Code is required.';
    tempErrors.civilStatus = patient_civilstatus ? '' : 'Civil Status is required.';

    setErrors({ ...tempErrors });
    return Object.values(tempErrors).every(x => x === '');
  };

  // Handle blur events for validation
  const handleBlur = (field, value) => {
    let error = '';
    switch (field) {
      case 'firstName':
        error = !value ? 'First Name is required' : '';
        break;
      case 'lastName':
        error = !value ? 'Last Name is required' : '';
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          error = 'Invalid email format';
        } else if (existingEmails.includes(value)) {
          error = 'Email already exists';
        }
        break;
      case 'dob':
        error = !value ? 'Date of birth is required' : '';
        break;
      case 'number':
        if (!value) {
          error = 'Contact number is required';
        } else if (!/^09\d{9}$/.test(value)) {
          error = 'Valid Philippine number starting with 09 and 11 digits long is required';
        } else if (existingContactNumbers.includes(value)) {
          error = 'Contact number already exists';
        }
        break;
      case 'gender':
        error = !value ? 'Gender is required' : '';
        break;
      case 'street':
        error = !value ? 'Street is required' : '';
        break;
      case 'region':
        error = !value ? 'Region is required' : '';
        break;
      case 'province':
        if (provinces.length > 0 && !value) {
          error = 'Province is required';
        } else {
          error = '';
        }
        break;
      case 'city':
        error = !value ? 'City/Municipality is required' : '';
        break;
      case 'barangay':
        error = !value ? 'Barangay is required' : '';
        break;
      case 'zipCode':
        error = !value ? 'Zip Code is required' : '';
        break;
      case 'civilStatus':
        error = !value ? 'Civil Status is required' : '';
        break;
      default:
        break;
    }
    setErrors(prevErrors => ({ ...prevErrors, [field]: error }));
  };

  // Input change handlers
  const handleTextInputChange = (setter) => (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setter(value);
  };

  const handleNumberInputChange = (setter) => (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setter(value);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageSrc(URL.createObjectURL(file));
      setIsCropModalOpen(true);
    }
  };

  const handleCroppedImage = (croppedImage) => {
    setPreviewImage(croppedImage);
    
    // Convert base64 to blob for upload
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" });
        setPatientImage(file);
      });
  };

  // Handle camera access
  const handleCameraAccess = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setCameraAccess(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      Swal.fire({
        icon: 'error',
        title: 'Camera Access Failed',
        text: 'Unable to access your camera. Please check permissions or try using a different browser.'
      });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to image
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      // Set as source for cropping
      setImageSrc(imageDataUrl);
      
      // Stop camera and open crop modal
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraAccess(false);
      setIsCropModalOpen(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraAccess(false);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validate()) {
      window.scrollTo(0, 0); // Scroll to top to see errors
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add all text fields to FormData
      formData.append('patient_firstName', patient_firstName);
      formData.append('patient_lastName', patient_lastName);
      formData.append('patient_middleInitial', patient_middleInitial);
      formData.append('patient_email', patient_email);
      formData.append('patient_dob', patient_dob);
      formData.append('patient_age', patient_age.toString());
      formData.append('patient_cnumber', patient_cnumber);
      formData.append('patient_gender', patient_gender);
      formData.append('accountStatus', accountStatus);
      formData.append('patient_nationality', patient_nationality);
      formData.append('patient_civilstatus', patient_civilstatus);
      
      // Add address fields
      formData.append('patient_address[street]', patient_address.street);
      formData.append('patient_address[barangay]', patient_address.barangay);
      formData.append('patient_address[city]', patient_address.city);
      formData.append('patient_address[province]', patient_address.province);
      formData.append('patient_address[region]', patient_address.region);
      formData.append('patient_address[zipCode]', patient_address.zipCode);
      
      // Add image if available
      if (patient_image) {
        formData.append('image', patient_image);
      }
      
      // Send the request with multipart/form-data
      const response = await axios.post(
        `${ip.address}/api/patient/api/unregistered`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      handleSuccessResponse(response);
    } catch (error) {
      console.error('Error creating patient:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'An error occurred while creating the patient.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessResponse = (response) => {
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Unregistered patient created successfully.',
      })
      window.location.reload();    
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to create patient.',
      });
    }
  };

  return (
    <Container className="py-4">
     
          <Form onSubmit={handleSubmit}>
            {/* Patient Photo Section */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Patient Photo</h5>
              </Card.Header>
              <Card.Body className="text-center">
                {previewImage ? (
                  <div className="mb-3">
                    <Image
                      src={previewImage}
                      roundedCircle
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        border: '2px solid #007bff'
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-3">
                    <Image
                      src={`${ip.address}/images/default-profile.jpg`}
                      roundedCircle
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        border: '2px solid #ddd'
                      }}
                    />
                  </div>
                )}
                
                <Row className="justify-content-center">
                  <Col md={6}>
                    <div className="d-grid gap-2">
                      <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={() => document.getElementById('fileInput').click()}
                        className="mb-2"
                      >
                        <i className="fas fa-upload me-2"></i> Upload Photo
                      </Button>
                      
                      {!cameraAccess ? (
                        <Button variant="outline-secondary" onClick={handleCameraAccess}>
                          <i className="fas fa-camera me-2"></i> Take Photo
                        </Button>
                      ) : (
                        <div className="camera-container mt-3 text-center">
                          <div className="position-relative d-inline-block">
                            <video
                              ref={videoRef}
                              style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                              autoPlay
                              playsInline
                              muted
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className="mt-2">
                              <Button variant="success" onClick={takePhoto}>
                                <i className="fas fa-camera me-2"></i> Capture
                              </Button>
                              <Button 
                                variant="danger" 
                                className="ms-2" 
                                onClick={stopCamera}
                              >
                                <i className="fas fa-times me-2"></i> Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Personal Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Personal Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="firstName">
                      <Form.Label>First Name<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter first name"
                        value={patient_firstName}
                        onChange={handleTextInputChange(setFirstName)}
                        onBlur={(e) => handleBlur('firstName', e.target.value)}
                        isInvalid={!!errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="lastName">
                      <Form.Label>Last Name<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter last name"
                        value={patient_lastName}
                        onChange={handleTextInputChange(setLastName)}
                        onBlur={(e) => handleBlur('lastName', e.target.value)}
                        isInvalid={!!errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="middleInitial">
                      <Form.Label>Middle Initial</Form.Label>
                      <Form.Control
                        type="text"
                        maxLength={1}
                        placeholder="Enter middle initial"
                        value={patient_middleInitial}
                        onChange={handleTextInputChange(setMiddleInitial)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="dob">
                      <Form.Label>Date of Birth<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        value={patient_dob}
                        onChange={(e) => setDob(e.target.value)}
                        onBlur={(e) => handleBlur('dob', e.target.value)}
                        isInvalid={!!errors.dob}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dob}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3" controlId="age">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="text"
                        value={patient_age}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3" controlId="gender">
                      <Form.Label>Gender<span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        value={patient_gender}
                        onChange={(e) => setGender(e.target.value)}
                        onBlur={(e) => handleBlur('gender', e.target.value)}
                        isInvalid={!!errors.gender}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.gender}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={patient_email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cnumber">
                      <Form.Label>Contact Number<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="09xxxxxxxxx"
                        maxLength={11}
                        value={patient_cnumber}
                        onChange={handleNumberInputChange(setCnumber)}
                        onBlur={(e) => handleBlur('number', e.target.value)}
                        isInvalid={!!errors.number}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.number}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Address Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Address Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3" controlId="street">
                      <Form.Label>Street/House No.<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter street address"
                        value={patient_address.street}
                        onChange={(e) => setPatientAddress({...patient_address, street: e.target.value})}
                        onBlur={(e) => handleBlur('street', e.target.value)}
                        isInvalid={!!errors.street}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.street}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="region">
                      <Form.Label>Region<span className="text-danger">*</span></Form.Label>
                      <Select
                        options={regions.map(region => ({
                          value: region.code,
                          label: region.regionName
                        }))}
                        value={selectedRegionCode}
                        onChange={(selectedOption) => {
                          setSelectedRegionCode(selectedOption);
                          handleBlur('region', selectedOption?.label || '');
                        }}
                        placeholder="Select a region"
                        isClearable
                        className={errors.region ? 'is-invalid' : ''}
                      />
                      {errors.region && (
                        <div className="invalid-feedback d-block">
                          {errors.region}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="province">
                      <Form.Label>Province{provinces.length > 0 && <span className="text-danger">*</span>}</Form.Label>
                      <Select
                        options={provinces.map(province => ({
                          value: province.code,
                          label: province.name
                        }))}
                        value={selectedProvinceCode}
                        onChange={(selectedOption) => {
                          setSelectedProvinceCode(selectedOption);
                          handleBlur('province', selectedOption?.label || '');
                        }}
                        placeholder={provinces.length > 0 ? "Select a province" : "No provinces available"}
                        isDisabled={!selectedRegionCode || provinces.length === 0}
                        isClearable
                        className={errors.province ? 'is-invalid' : ''}
                      />
                      {errors.province && (
                        <div className="invalid-feedback d-block">
                          {errors.province}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="city">
                      <Form.Label>City/Municipality<span className="text-danger">*</span></Form.Label>
                      <Select
                        options={cities.map(city => ({
                            value: city.code,
                            label: city.name
                          }))}
                          value={selectedCityMunCode}
                          onChange={(selectedOption) => {
                            setSelectedCityMunCode(selectedOption);
                            handleBlur('city', selectedOption?.label || '');
                          }}
                          placeholder={cities.length > 0 ? "Select a city/municipality" : "No cities available"}
                          isDisabled={!selectedRegionCode || cities.length === 0}
                          isClearable
                          className={errors.city ? 'is-invalid' : ''}
                        />
                        {errors.city && (
                          <div className="invalid-feedback d-block">
                            {errors.city}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="barangay">
                        <Form.Label>Barangay<span className="text-danger">*</span></Form.Label>
                        <Select
                          options={barangays.map(barangay => ({
                            value: barangay.code,
                            label: barangay.name
                          }))}
                          onChange={(selectedOption) => {
                            setPatientAddress({...patient_address, barangay: selectedOption?.label || ''});
                            handleBlur('barangay', selectedOption?.label || '');
                          }}
                          placeholder={barangays.length > 0 ? "Select a barangay" : "No barangays available"}
                          isDisabled={!selectedCityMunCode || barangays.length === 0}
                          isClearable
                          className={errors.barangay ? 'is-invalid' : ''}
                        />
                        {errors.barangay && (
                          <div className="invalid-feedback d-block">
                            {errors.barangay}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="zipCode">
                        <Form.Label>Zip Code<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter zip code"
                          maxLength={4}
                          value={patient_address.zipCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setPatientAddress({...patient_address, zipCode: value});
                          }}
                          onBlur={(e) => handleBlur('zipCode', e.target.value)}
                          isInvalid={!!errors.zipCode}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.zipCode}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
  
              {/* Additional Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Additional Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="nationality">
                        <Form.Label>Nationality</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter nationality"
                          value={patient_nationality}
                          onChange={handleTextInputChange(setPatientNationality)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="civilStatus">
                        <Form.Label>Civil Status<span className="text-danger">*</span></Form.Label>
                        <Select
                          options={civilStatusOptions}
                          onChange={(selectedOption) => {
                            setPatientCivilStatus(selectedOption?.value || '');
                            handleBlur('civilStatus', selectedOption?.value || '');
                          }}
                          placeholder="Select civil status"
                          isClearable
                          className={errors.civilStatus ? 'is-invalid' : ''}
                        />
                        {errors.civilStatus && (
                          <div className="invalid-feedback d-block">
                            {errors.civilStatus}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
  
              {/* Form buttons */}
              <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={() => navigate('/patients')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Unregistered Patient'
                  )}
                </Button>
              </div>
            </Form>
 
   
  
        {/* Image crop modal */}
        <CropResizeTiltModal
          show={isCropModalOpen}
          handleClose={() => setIsCropModalOpen(false)}
          imageSrc={imageSrc}
          onSave={handleCroppedImage}
        />
      </Container>
    );
  };
  
  export default CreatePatientForms;
