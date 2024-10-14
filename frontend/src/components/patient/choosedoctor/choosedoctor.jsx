import { useNavigate } from "react-router-dom";
import { Card, Form, Row, Col, Button, Container } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import './ChooseDoctor.css';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { usePatient } from "../PatientContext";
import { Helmet } from "react-helmet";
import Footer from "../../Footer";
import { ip } from "../../../ContentExport";
const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
function ChooseDoctor() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [selectedDays, setSelectedDays] = useState({
        monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
    });
    const [availability, setAvailability] = useState({
        am: false, pm: false
    });
    const [clinicHoursRange, setClinicHoursRange] = useState({ start: '', end: '' });

    const { patient } = usePatient();
    const { setDoctorId } = usePatient();
    const navigate = useNavigate();

    // Fetch all doctors and populate specializations
    useEffect(() => {
        axios.get(`${ip.address}/api/doctor/api/alldoctor`)
            .then((res) => {
                const doctorsData = res.data.theDoctor;
                setDoctors(doctorsData);
                setFilteredDoctors(doctorsData); // Set initial filtered list to all doctors

                // Extract unique specializations
                const uniqueSpecializations = [...new Set(doctorsData.map(doctor => doctor.dr_specialty))];
                setSpecializations(uniqueSpecializations);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const handleDoctorClick = (did) => {
        setDoctorId(did);
        navigate('/doctorprofile');
    };

    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleSpecializationChange = (e) => {
        setSelectedSpecialization(e.target.value);
    };

    const handleDayChange = (e) => {
        const { name, checked } = e.target;
        setSelectedDays(prevDays => ({ ...prevDays, [name]: checked }));
    };

    const handleAvailabilityChange = (e) => {
        const { name, checked } = e.target;
        setAvailability(prevAvailability => ({ ...prevAvailability, [name]: checked }));
    };

    const handleClinicHoursChange = (e) => {
        const { name, value } = e.target;
        setClinicHoursRange(prevRange => ({ ...prevRange, [name]: value }));
    };

    const filterDoctors = () => {
        const filtered = doctors.filter((doctor) => {
            // Filter by name or specialization
            const doctorName = doctor.dr_firstName && doctor.dr_lastName ? `${doctor.dr_firstName} ${doctor.dr_lastName}`.toLowerCase() : '';
            const doctorSpecialty = doctor.dr_specialty || '';

            const matchesName = doctorName.includes(searchName.toLowerCase());
            const matchesSpecialty = selectedSpecialization === '' || doctorSpecialty === selectedSpecialization;

            // Filter by selected days and availability (AM/PM)
            const selectedDaysArray = Object.keys(selectedDays).filter(day => selectedDays[day]);
            const matchesDays = selectedDaysArray.length === 0 || selectedDaysArray.some(day => {
                const scheduleForDay = doctor.availability?.[day]; // Access availability by day
                return scheduleForDay && (
                    (!availability.am || scheduleForDay.morning?.available) &&
                    (!availability.pm || scheduleForDay.afternoon?.available)
                );
            });

            // Filter by clinic hours range
            const matchesClinicHours = (!clinicHoursRange.start && !clinicHoursRange.end) || 
                Object.values(doctor.availability || {}).some(schedule => {
                    return (
                        (!clinicHoursRange.start || (schedule.morning?.startTime >= clinicHoursRange.start && schedule.morning?.endTime <= clinicHoursRange.end)) ||
                        (!clinicHoursRange.end || (schedule.afternoon?.startTime >= clinicHoursRange.start && schedule.afternoon?.endTime <= clinicHoursRange.end))
                    );
                });

            return matchesName && matchesSpecialty && matchesDays && matchesClinicHours;
        });

        setFilteredDoctors(filtered);
    };

    const timeSinceLastActive = (lastActive) => {
        if (!lastActive) return "Inactive";
    
        const now = new Date();
        const lastActiveDate = new Date(lastActive);
        const secondsAgo = Math.floor((now - lastActiveDate) / 1000);
        const minutesAgo = Math.floor(secondsAgo / 60);
        const hoursAgo = Math.floor(minutesAgo / 60);
        const daysAgo = Math.floor(hoursAgo / 24);
        const weeksAgo = Math.floor(daysAgo / 7);
    
        if (minutesAgo < 1) return "Active just now";
        if (minutesAgo < 60) return `Active ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
        if (hoursAgo < 24) return `Active ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        if (daysAgo < 7) return `Active ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        return `Active ${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
    };

    useEffect(() => {
        filterDoctors(); // Apply the filter every time the search or filters change
    }, [searchName, selectedSpecialization, selectedDays, availability, clinicHoursRange]);

    return (
        <>
            <Helmet>
                <title>Molino Care | Patient</title>
            </Helmet>
            <PatientNavBar pid={patient._id} />
        
            <Container  className='cont-fluid-no-gutter' fluid style={{overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem'}}>
                <div className="maincolor-container">
                    <div className="content-area">
                        <Container className="announcement-container white-background align-items-center mt-3 mb-3 shadow-sm p-5">
                            <Form className="mb-4">
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Search by Doctor's Name</Form.Label>
                                            <Form.Control type="text" value={searchName} onChange={handleSearchChange} placeholder="Doctor's Name" />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Filter by Specialization</Form.Label>
                                            <Form.Control as="select" value={selectedSpecialization} onChange={handleSpecializationChange}>
                                                <option value="">All Specializations</option>
                                                {specializations.map((specialization, index) => (
                                                    <option key={index} value={specialization}>
                                                        {specialization}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Availability</Form.Label>
                                            <Form.Check label="AM" name="am" checked={availability.am} onChange={handleAvailabilityChange} />
                                            <Form.Check label="PM" name="pm" checked={availability.pm} onChange={handleAvailabilityChange} />
                                        </Form.Group>
                                   
                                    
                                    <Form.Group>
                                        <Form.Label>Clinic Days</Form.Label>
                                        <Row>
                                            <Col xs={12} sm={6} md={3} lg={2}>
                                            <Form.Check
                                                label="Mon"
                                                name="monday"
                                                checked={selectedDays.monday}
                                                onChange={handleDayChange}
                                            />
                                            </Col>
                                            <Col xs={12} sm={6} md={3} lg={2}>
                                            <Form.Check
                                                label="Tue"
                                                name="tuesday"
                                                checked={selectedDays.tuesday}
                                                onChange={handleDayChange}
                                            />
                                            </Col>
                                            <Col xs={12} sm={6} md={3} lg={2}>
                                            <Form.Check
                                                label="Wed"
                                                name="wednesday"
                                                checked={selectedDays.wednesday}
                                                onChange={handleDayChange}
                                            />
                                            </Col>
                                            <Col xs={12} sm={6} md={3} lg={2}>
                                            <Form.Check
                                                label="Thu"
                                                name="thursday"
                                                checked={selectedDays.thursday}
                                                onChange={handleDayChange}
                                            />
                                            </Col>
                                            <Col xs={12} sm={6} md={3} lg={2}>
                                            <Form.Check
                                                label="Fri"
                                                name="friday"
                                                checked={selectedDays.friday}
                                                onChange={handleDayChange}
                                            />
                                            </Col>
                                            <Col xs={12} sm={6} md={3} lg={2}>
                                            <Form.Check
                                                label="Sat"
                                                name="saturday"
                                                checked={selectedDays.saturday}
                                                onChange={handleDayChange}
                                            />
                                            </Col>
                                            <Col xs={12} sm={6} md={3} lg={2}>
                                            <Form.Check
                                                label="Sun"
                                                name="sunday"
                                                checked={selectedDays.sunday}
                                                onChange={handleDayChange}
                                            />
                                            </Col>
                                        </Row>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Clinic Hours</Form.Label>
                                            <Form.Control type="time" name="start" value={clinicHoursRange.start} onChange={handleClinicHoursChange} />
                                            <Form.Control type="time" name="end" value={clinicHoursRange.end} onChange={handleClinicHoursChange} className="mt-2" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                              
                            </Form>
                        </Container>

                        <div className="cd-main">
                            <div className="cd-containergrid">
                                {filteredDoctors.map((doctor) => {
                                    const doctorImage = doctor.dr_image || defaultImage;

                                    // Define the status color based on the activity status
                                    const statusColor = doctor.activityStatus === 'Online' ? 'green' 
                                                        : doctor.activityStatus === 'In Session' ? 'orange' 
                                                        : 'gray';

                                    return (
                                        <Card key={doctor._id} className="cd-card" onClick={() => handleDoctorClick(doctor._id)}>
                                            <Card.Img variant="top" src={`${ip.address}/${doctorImage}`} />
                                            <Card.Body>
                                                <Card.Title style={{ textAlign: "center" }}>
                                                    {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                                                </Card.Title>
                                                <p style={{ textAlign: 'center', fontSize: '14px', fontStyle: 'italic' }}>
                                                    {doctor.dr_specialty}
                                                </p>

                                                {/* Adding Activity Status below the card */}
                                                <p style={{ textAlign: 'center',  fontSize: '12px' }}>
                                                        <span className="status-indicator" style={{ backgroundColor: statusColor, borderRadius: '50%', display: 'inline-block', width: '10px', height: '10px', marginRight: '8px' }}></span>
                                                        {doctor.activityStatus === 'Online' ? 'Online' 
                                                            : doctor.activityStatus === 'In Session' ? 'In Session' 
                                                            : `Last Active: ${timeSinceLastActive(doctor.lastActive)}`}
                                                    </p>

                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>


                    </div>
                        <div className="footer-container">
                            <Footer />
                        </div>


                </div>
            </Container>
       


            
        </>
    );
}

export default ChooseDoctor;
