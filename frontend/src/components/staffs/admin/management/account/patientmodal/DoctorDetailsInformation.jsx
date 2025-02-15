import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../../../navbar/AdminNavbar';
import SidebarAdmin from '../../../sidebar/SidebarAdmin';
import { ip } from '../../../../../../ContentExport';

function DoctorDetailsInformation() {
    const location = useLocation();
    const { doctorId, userId, userName, role } = location.state || {};  // Access patientId via location.state
    const did = doctorId;
    const [activeTab, setActiveTab] = useState('biography');
    const [error, setError] = useState(null);
    const [doctorData, setDoctorData] = useState({
        theId: "",
        theName: "",
        theImage: "images/014ef2f860e8e56b27d4a3267e0a193a.jpg",
        theLastName: "",
        theMI: "",
        email: "",
        cnumber: "",
        password: "",
        dob: "",
        specialty: ""
    });
    const [fullname, setFullname] = useState("");
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [biography, setBiography] = useState({
    medicalSchool: {
      institution: '',
      yearGraduated: ''
    },
    residency: {
      institution: '',
      yearCompleted: ''
    },
    fellowship: {
      institution: '',
      yearCompleted: ''
    },
    localSpecialtyBoard: {
      certification: '',
      issuingOrganization: '',
      year: ''
    },
    localSubSpecialtyBoard: {
      certification: '',
      issuingOrganization: '',
      year: ''
    }
  });
    console.log(doctorId)
    const handleSelect = (selectedKey) => {
        // Update the active tab based on the selected event key
        setActiveTab(selectedKey);
    };

    useEffect(() => {
        axios.get(`${ip.address}/api/doctor/api/finduser/${did}`)
            .then((res) => {
                const data = res.data.theDoctor;
                setDoctorData({
                    theId: data._id,
                    theName: data.dr_firstName,
                    theImage: data.dr_image || doctorData.theImage,
                    theLastName: data.dr_lastName,
                    theMI: data.dr_middleInitial,
                    email: data.dr_email,
                    cnumber: data.dr_contactNumber,
                    dob: data.dr_dob,
                    password: data.dr_password,
                    specialty: data.dr_specialty

                });

                console.log(data)

                setBiography(data.biography || {});

                setFullname(`${data.dr_firstName} ${data.dr_middleInitial}. ${data.dr_lastName}`);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [did]);

    const handleUpdate = (updatedData) => {
        axios.put(`${ip.address}/api/doctor/api/${did}/updateDetails`, updatedData)
            .then((response) => {
                const data = response.data.updatedDoctor;
                setDoctorData({
                    theId: data._id,
                    theName: data.dr_firstName,
                    theImage: data.dr_image || doctorData.theImage,
                    theLastName: data.dr_lastName,
                    theMI: data.dr_middleInitial,
                    email: data.dr_email,
                    cnumber: data.dr_contactNumber,
                    dob: data.dr_dob,
                    password: data.dr_password,
                    specialty: data.dr_specialty
                });
                setIsUpdateModalOpen(false);
            })
            .catch((error) => {
                console.error('Error updating information:', error);
            });
    };

    console.log(doctorData)
    return (
        <div className="d-flex justify-content-center">
            <SidebarAdmin userId={userId} userName={userName} role={role} />
            <Container fluid className="cont-fluid-no-gutter" style={{ width: '100%', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
                <AdminNavbar userId={userId} userName={userName} role={role} />


                <Container className="ad-container" style={{ height: 'calc(100vh)', overflowY: 'auto', padding: '20px' }}>

                    {doctorData ? (
                        <div>
                            <Row>
                                <Col md={12} className="mt-4">
                                    <Card className="pi-container2 shadow-sm mb-5 w-100">
                                        <Card.Header className="card-header-modded"><strong className="font-16">Personal Information</strong></Card.Header>
                                        <Card.Body>
                                            <div className=' d-flex align-items-center mb-4'>
                                                <img className="ai-image" src={`${ip.address}/${doctorData.theImage}`} />
                                                <div style={{ marginLeft: '1rem' }} className="d-flex align-items-center justify-content-between w-100">
                                                    <div>
                                                        <h4 className="m-0">{fullname}</h4>
                                                        <p style={{ fontSize: '15px' }}>{doctorData.specialty}</p>
                                                    </div>


                                                </div>


                                            </div>

                                            <Row>

                                                <Col>
                                                    <p><strong>Email:</strong> {doctorData.email}</p>
                                                </Col>
                                                <Col>
                                                    <p><strong>Phone:</strong> {doctorData.cnumber}</p>
                                                </Col>
                                            </Row>
                                            <Row>

                                                <Col>
                                                    <p><strong>Date of Birth:</strong> {new Date(doctorData.dob).toLocaleDateString()}</p>
                                                </Col>
                                            </Row>




                                        </Card.Body>
                                    </Card>

                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <h1>Loading...</h1>
                    )}

                    <div className='pnb-component'>
                        <Container className='d-flex p-0'>
                            <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={handleSelect}>

                                <Nav.Item>
                                    <Nav.Link eventKey="biography">Biography</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Container>

                        {/* Render components based on the active tab */}
                        <Container className={`pnb-content ${activeTab === 'findings' ? 'findings-tab' : 'other-tabs'}`}>
                                   <div className="biography-details">
                                     <Row>
                                       <Col xs={12} md={12}>
                                         {/* Medical School */}
                                         <h5><strong>Medical School</strong></h5>
                                         <p>{biography.medicalSchool?.institution || 'N/A'}</p>
                                         <br />
                           
                                         {/* Residency */}
                                         <h5><strong>Residency</strong></h5>
                                         <p>{biography.residency?.institution || 'N/A'}</p>
                                         <br />
                           
                                         {/* Fellowship */}
                                         <h5><strong>Fellowship</strong></h5>
                                         <p>{biography.fellowship?.institution || 'N/A'}</p>
                                         <br />
                           
                                         {/* Local Specialty Board */}
                                         <h5><strong>Local Specialty Board</strong></h5>
                                         <p>{biography.localSpecialtyBoard?.issuingOrganization || 'N/A'}</p>
                                         <br />
                           
                                         {/* Local Sub Specialty Board */}
                                         <h5><strong>Local Sub Specialty Board</strong></h5>
                                         <p>{biography.localSubSpecialtyBoard?.issuingOrganization || 'N/A'}</p>
                                         <br />
                                       </Col>
                                     </Row>
                                   </div>
                        </Container>
                    </div>
                </Container>











            </Container>
        </div>
    );
}

export default DoctorDetailsInformation;

