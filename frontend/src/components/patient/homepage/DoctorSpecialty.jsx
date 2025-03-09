import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import './DoctorSpecialty.css';
import { Container } from "react-bootstrap";
import { ip } from "../../../ContentExport";

function DoctorSpecialty({ pid, did }) {
    const [specialties, setSpecialties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        axios.get(`${ip.address}/api/doctor/api/specialties`)
            .then((res) => {
                const data = res.data.specialties;
                if (Array.isArray(data)) {
                    setSpecialties(data);
                } else {
                    console.error("Expected an array but received:", data);
                    setSpecialties([]);
                }
            })
            .catch((err) => {
                console.log("API call failed:", err);
                setSpecialties([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleSpecialtyClick = (specialtyName) => {
        navigate(`/choosedoctor/${specialtyName.toLowerCase().replace(/\s+/g, '-')}`);
    };

    return (
        <div className="specialty-section">
            <Container>
                <div className="specialty-header">
                    <h2 className="specialty-title">Medical Specialties</h2>
                    <p className="specialty-subtitle">Choose from our wide range of medical specializations</p>
                </div>
                
                {isLoading ? (
                    <div className="specialty-loading">
                        <div className="specialty-loading-pulse"></div>
                        <p>Loading specialties...</p>
                    </div>
                ) : specialties.length > 0 ? (
                    <div className="specialty-grid">
                        {specialties.map((specialty, index) => (
                            <div
                                key={index}
                                className="specialty-card"
                                onClick={() => handleSpecialtyClick(specialty.name)}
                            >
                                <div className="specialty-card-inner">
                                    <div className="specialty-image-container">
                                        <img
                                            src={`${ip.address}/${specialty.imageUrl}`}
                                            alt={specialty.name}
                                            className="specialty-image"
                                        />
                                        <div className="specialty-overlay">
                                            <span className="specialty-view-btn">View Doctors</span>
                                        </div>
                                    </div>
                                    <div className="specialty-info">
                                        <h3 className="specialty-name">{specialty.name}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="specialty-empty">
                        <p>No specialties available at the moment</p>
                        <small>Please check back later</small>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default DoctorSpecialty;