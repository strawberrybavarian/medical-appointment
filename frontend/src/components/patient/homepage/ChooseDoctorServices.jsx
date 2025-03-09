import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { ip } from "../../../ContentExport";
import { usePatient } from "../PatientContext";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { ClockFill, GeoAltFill, StarFill, PersonSquare, TelephoneFill } from "react-bootstrap-icons";

function ChooseDoctorServices() {
    const [theDoctors, setAllDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const { services, pid } = useParams();
    const navigate = useNavigate();
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const { patient, setDoctorId } = usePatient();

    useEffect(() => {
        setLoading(true);
        // Format service name for display
        const formattedService = services.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        // Fetch all doctors
        axios.get(`${ip.address}/api/doctor/api/alldoctor`)
            .then((res) => {
                // Filter doctors who provide the selected service
                const filteredDoctors = res.data.theDoctor.filter(doctor => 
                    doctor.dr_services && doctor.dr_services.some(service => 
                        service.name.toLowerCase() === services.replace(/-/g, ' ').toLowerCase()
                    )
                );
                setAllDoctors(filteredDoctors);
            })
            .catch((err) => {
                console.log('Error fetching doctors:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [services]);

    const handleDoctorClick = (did) => {
        setDoctorId(did);
        navigate(`/doctorprofile`);
    };
    
    // Format service name for display
    const formattedServiceName = services.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return (
        <>
            <PatientNavBar pid={patient._id} />
            
            <div className="cds-page-container">
                <Container className="py-4">
                    <div className="cds-header">
                        <h2 className="cds-title">{formattedServiceName} Specialists</h2>
                        <p className="cds-subtitle">
                            Choose a specialist for your {formattedServiceName.toLowerCase()} needs
                        </p>
                    </div>

                    {loading ? (
                        <div className="cds-loading">
                            <div className="cds-loading-spinner"></div>
                            <p>Finding the best specialists for you...</p>
                        </div>
                    ) : (
                        <Row className="cds-doctor-grid">
                            {theDoctors.length > 0 ? (
                                theDoctors.map((doctor, index) => (
                                    <Col key={index} lg={4} md={6} sm={12} className="mb-4">
                                        <Card 
                                            className="cds-doctor-card" 
                                            onClick={() => handleDoctorClick(doctor._id)}
                                        >
                                            <div className="cds-doctor-header">
                                                <div className="cds-doctor-img">
                                                    <img 
                                                        src={`${ip.address}/${doctor.dr_image || defaultImage}`}
                                                        alt={`Dr. ${doctor.dr_lastName}`}
                                                    />
                                                </div>
                                                <div className="cds-doctor-badges">
                                                    <Badge className="cds-experience-badge">
                                                        {doctor.dr_experience || "New"} 
                                                        {doctor.dr_experience ? 
                                                            ` year${doctor.dr_experience > 1 ? 's' : ''} exp.` : 
                                                            " Doctor"}
                                                    </Badge>
                                                    {doctor.activityStatus && (
                                                        <Badge 
                                                            className={`cds-status-badge ${
                                                                doctor.activityStatus === "Online" ? "online" : 
                                                                doctor.activityStatus === "In Session" ? "in-session" : 
                                                                "offline"
                                                            }`}
                                                        >
                                                            {doctor.activityStatus}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <Card.Body className="cds-doctor-body">
                                                <h3 className="cds-doctor-name">
                                                    Dr. {doctor.dr_firstName} {doctor.dr_middleInitial && `${doctor.dr_middleInitial}.`} {doctor.dr_lastName}
                                                </h3>
                                                <div className="cds-doctor-specialty">
                                                    {doctor.dr_specialty}
                                                </div>
                                                
                                                <div className="cds-doctor-details">
                                                    {doctor.dr_clinicLocation && (
                                                        <div className="cds-detail-item">
                                                            <GeoAltFill className="cds-detail-icon" />
                                                            <span>{doctor.dr_clinicLocation}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {doctor.dr_schedule && (
                                                        <div className="cds-detail-item">
                                                            <ClockFill className="cds-detail-icon" />
                                                            <span>{doctor.dr_schedule}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {doctor.dr_services && (
                                                    <div className="cds-doctor-services mt-3">
                                                        <h6 className="cds-services-title">Services:</h6>
                                                        <div className="cds-service-tags">
                                                            {doctor.dr_services.slice(0, 3).map((service, idx) => (
                                                                <span key={idx} className="cds-service-tag">
                                                                    {service.name}
                                                                </span>
                                                            ))}
                                                            {doctor.dr_services.length > 3 && (
                                                                <span className="cds-more-tag">
                                                                    +{doctor.dr_services.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="cds-doctor-footer">
                                                    <div className="cds-rating">
                                                        <StarFill className="cds-star-icon" />
                                                        <span>{doctor.dr_rating || "4.8"}</span>
                                                    </div>
                                                    <span className="cds-view-profile">View Profile</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col xs={12}>
                                    <div className="cds-empty-state">
                                        <PersonSquare className="cds-empty-icon" />
                                        <h4>No Specialists Found</h4>
                                        <p>We couldn't find any specialists for {formattedServiceName} at this time.</p>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    )}
                </Container>
            </div>
        </>
    );
}

export default ChooseDoctorServices;