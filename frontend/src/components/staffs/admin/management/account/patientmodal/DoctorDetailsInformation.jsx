import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Nav, Button, Badge, Table } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaUserCog } from 'react-icons/fa';
import AdminNavbar from '../../../navbar/AdminNavbar';
import SidebarAdmin from '../../../sidebar/SidebarAdmin';
import { ip } from '../../../../../../ContentExport';
import EditDoctorDetails from './EditDoctorDetails';
import AdminDoctorAvailability from './AdminDoctorAvailability';
import AdminDoctorScheduleManagement from './AdminDoctorScheduleManagement';
function DoctorDetailsInformation() {
    const location = useLocation();
    const { doctorId, userId, userName, role } = location.state || {};
    const did = doctorId;
    const [activeTab, setActiveTab] = useState('biography');
    const [error, setError] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
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
    const [availability, setAvailability] = useState({});
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);

    const handleSelect = (selectedKey) => {
        setActiveTab(selectedKey);
    };

    // Get badge variant based on account status
    const getBadgeVariant = (status) => {
        switch (status) {
            case 'Registered': return 'success';
            case 'Unregistered': return 'warning';
            case 'Deactivated': return 'danger';
            case 'Archived': return 'dark';
            default: return 'secondary';
        }
    };

    useEffect(() => {
        axios.get(`${ip.address}/api/doctor/api/finduser/${did}`)
            .then((res) => {
                const data = res.data.theDoctor;
                setDoctor(data);
                setBiography(data.biography || {});
            })
            .catch((err) => {
                console.error('Error fetching doctor details:', err);
                setError('Failed to fetch doctor information');
            });
            
        // Fetch doctor availability
        axios.get(`${ip.address}/api/doctor/${did}/available`)
            .then(res => {
                const { availability, activeAppointmentStatus } = res.data;
                setAvailability(availability || {});
                setActiveAppointmentStatus(activeAppointmentStatus);
            })
            .catch(err => {
                console.error('Error fetching doctor availability:', err);
            });
    }, [did]);

    const handleUpdateDoctor = (updatedData) => {
        axios.put(`${ip.address}/api/doctor/api/${did}/updateDetails`, updatedData)
            .then((response) => {
                setDoctor(response.data.updatedDoctor);
                setShowEditModal(false);
            })
            .catch((error) => {
                console.error('Error updating information:', error);
            });
    };
    
    // Function to render the weekly schedule
    const renderAvailability = (day) => {
        const dayAvailability = availability[day];
        if (!dayAvailability) return <td colSpan="2">Not configured</td>;

        const formatTime = (time) => {
            if (!time) return 'Not set';
            
            const [hour, minute] = time.split(':');
            const parsedHour = parseInt(hour);
            if (parsedHour === 12) {
                return `${hour}:${minute} PM`;
            } else if (parsedHour > 12) {
                return `${parsedHour - 12}:${minute} PM`;
            } else {
                return `${hour}:${minute} AM`;
            }
        };

        const morningAvailability = dayAvailability.morning?.available 
            ? `${formatTime(dayAvailability.morning.startTime)} - ${formatTime(dayAvailability.morning.endTime)}` 
            : 'Not available';
            
        const afternoonAvailability = dayAvailability.afternoon?.available 
            ? `${formatTime(dayAvailability.afternoon.startTime)} - ${formatTime(dayAvailability.afternoon.endTime)}` 
            : 'Not available';

        return (
            <>
                <td>{morningAvailability}</td>
                <td>{afternoonAvailability}</td>
            </>
        );
    };

    return (
        <div className="d-flex justify-content-center">
            <SidebarAdmin userId={userId} userName={userName} role={role} />
            <Container fluid className="cont-fluid-no-gutter" style={{ width: '100%', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
                <AdminNavbar userId={userId} userName={userName} role={role} />
                
                <Container className="ad-container" style={{ height: 'calc(100vh)', overflowY: 'auto', padding: '20px' }}>
                    {doctor ? (
                        <div>
                      
                            
                            <Row className="mb-4">
                                <Col md={12}>
                                    <Card className="pi-container2 shadow-sm w-100" style={{border: 'none'}}>
                                        <Card.Header className="card-header-modded d-flex justify-content-between align-items-center">
                                            <h4 className="mb-0">Personal Information</h4>
                                            <div>
                                    <span className="me-2">Account Status:</span>
                                    <Badge 
                                        bg={getBadgeVariant(doctor.accountStatus)} 
                                        style={{ fontSize: '1rem', padding: '8px 12px' }}
                                    >
                                        {doctor.accountStatus || 'Unknown'}
                                    </Badge>
                                </div>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className='d-flex align-items-center justify-content-between mb-4'> 
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        {doctor.dr_image ? (
                                                            <img 
                                                                src={`${ip.address}/${doctor.dr_image}`}
                                                                alt={`${doctor.dr_firstName}'s profile`} 
                                                                style={{
                                                                    width: '100px', 
                                                                    height: '100px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '50%',
                                                                    border: '3px solid #f0f0f0',
                                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div 
                                                                style={{
                                                                    width: '100px', 
                                                                    height: '100px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#e9ecef',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '2rem',
                                                                    color: '#6c757d',
                                                                    border: '3px solid #f0f0f0'
                                                                }}
                                                            >
                                                                {doctor.dr_firstName.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="m-0 fw-bold">{`${doctor.dr_firstName} ${doctor.dr_middleInitial || ''} ${doctor.dr_lastName}`}</h4>
                                                        <p className="text-muted" style={{fontSize: '15px'}}>{doctor.dr_specialty}</p>
                                                        <p className="mb-0" style={{fontSize: '14px'}}><strong>ID:</strong> {doctor._id}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Button 
                                                        variant="outline-primary" 
                                                        onClick={() => setShowEditModal(true)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <FaEdit className="me-1" /> Edit Profile
                                                    </Button>
                                                </div>
                                            </div>

                                            <hr className="my-3" />

                                            <Row className="mt-3">
                                                <Col md={6}>
                                                    <p><strong>Email:</strong> <span className="text-muted">{doctor.dr_email}</span></p>    
                                                </Col>
                                                <Col md={6}>
                                                    <p><strong>Phone:</strong> <span className="text-muted">{doctor.dr_contactNumber}</span></p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <p><strong>Date of Birth:</strong> <span className="text-muted">{new Date(doctor.dr_dob).toLocaleDateString()}</span></p>
                                                </Col>
                                                <Col md={6}>
                                                    <p><strong>Specialty:</strong> <span className="text-muted">{doctor.dr_specialty}</span></p>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        
                        </div>
                    ) : (
                        <div className="text-center p-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading doctor details...</p>
                        </div>
                    )}

                    <div className='pnb-component mt-4'>
                        <Container className='d-flex p-0'>
                            <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={handleSelect}>
                                <Nav.Item>
                                    <Nav.Link eventKey="biography">Biography</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="appointments">Appointment Management</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Container>

                        <Container className="pnb-content shadow-sm mt-0 p-4 bg-white">
                            {activeTab === 'biography' && (
                                <div className="biography-details">
                                    <Row>
                                        <Col xs={12} md={12}>
                                            {/* Medical School */}
                                            <div className="mb-4">
                                                <h5 className="fw-bold">Medical School</h5>
                                                <p className="text-muted mb-1">Institution: {biography.medicalSchool?.institution || 'N/A'}</p>
                                                <p className="text-muted">Year Graduated: {biography.medicalSchool?.yearGraduated || 'N/A'}</p>
                                            </div>
                                            
                                            {/* Residency */}
                                            <div className="mb-4">
                                                <h5 className="fw-bold">Residency</h5>
                                                <p className="text-muted mb-1">Institution: {biography.residency?.institution || 'N/A'}</p>
                                                <p className="text-muted">Year Completed: {biography.residency?.yearCompleted || 'N/A'}</p>
                                            </div>
                                            
                                            {/* Fellowship */}
                                            <div className="mb-4">
                                                <h5 className="fw-bold">Fellowship</h5>
                                                <p className="text-muted mb-1">Institution: {biography.fellowship?.institution || 'N/A'}</p>
                                                <p className="text-muted">Year Completed: {biography.fellowship?.yearCompleted || 'N/A'}</p>
                                            </div>
                                            
                                            {/* Local Specialty Board */}
                                            <div className="mb-4">
                                                <h5 className="fw-bold">Local Specialty Board</h5>
                                                <p className="text-muted mb-1">Certification: {biography.localSpecialtyBoard?.certification || 'N/A'}</p>
                                                <p className="text-muted mb-1">Issuing Organization: {biography.localSpecialtyBoard?.issuingOrganization || 'N/A'}</p>
                                                <p className="text-muted">Year: {biography.localSpecialtyBoard?.year || 'N/A'}</p>
                                            </div>
                                            
                                            {/* Local Sub Specialty Board */}
                                            <div className="mb-4">
                                                <h5 className="fw-bold">Local Sub Specialty Board</h5>
                                                <p className="text-muted mb-1">Certification: {biography.localSubSpecialtyBoard?.certification || 'N/A'}</p>
                                                <p className="text-muted mb-1">Issuing Organization: {biography.localSubSpecialtyBoard?.issuingOrganization || 'N/A'}</p>
                                                <p className="text-muted">Year: {biography.localSubSpecialtyBoard?.year || 'N/A'}</p>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                            
                            {activeTab === 'appointments' && (
                                <div>
                                                                    <AdminDoctorAvailability doctorId={did} />

                                        <AdminDoctorScheduleManagement doctorId={did} />
                                </div>
                                
                            )}
                        </Container>
                    </div>
                    
                    {/* Doctor Edit Modal */}
                    <EditDoctorDetails 
                        show={showEditModal}
                        handleClose={() => setShowEditModal(false)}
                        doctorData={doctor}
                        handleUpdate={handleUpdateDoctor}
                    />
                </Container>
            </Container>
        </div>
    );
}

export default DoctorDetailsInformation;