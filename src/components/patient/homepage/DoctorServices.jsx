import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import './DoctorSpecialty.css';
import OBGYNE from './images/ObstetricsAndGynecology.png';
import PEDIATRICS from './images/Pedia.png';
import { Container } from "react-bootstrap";

function DoctorServices({ pid, did }) {
    const [services, setServices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the list of services from the backend
        axios.get('http://localhost:8000/admin/getall/services')
            .then((res) => {
                setServices(res.data || []); // Ensure services is always an array
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const handleServiceClick = (service) => {
        navigate(`/choosedoctor/service/${service.name.toLowerCase()}`);
    };

    // Mapping service names to their respective images (optional)
    const serviceImages = {
        "Obstetrics": OBGYNE,
        "Pediatrics": PEDIATRICS,
        "Gynecology": OBGYNE,
        // Add other mappings here as needed
    };

    const getImage = (serviceName) => {
        return serviceImages[serviceName] || null;
    };

    return (
        <>
            <Container>
                <h4 style={{ marginLeft: '15px', marginTop: '2rem' }}>List of Services</h4>
            </Container>
            <Container className="ds-container">
                {services.length > 0 ? (
                    services.map((service, index) => (
                        <div
                            key={index}
                            className="specialtyButtonStyle"
                            onClick={() => handleServiceClick(service)}
                        >
                            <div className="ds-imgcontainer">
                                <img src={getImage(service.name)} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <p style={{ fontWeight: '600', textAlign: 'center' }}>{service.name}</p>
                               
                               
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No services available</div>
                )}
            </Container>
        </>
    );
}

export default DoctorServices;
