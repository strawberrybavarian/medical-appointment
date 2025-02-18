import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import './DoctorSpecialty.css';
import { Container } from "react-bootstrap";
import { ip } from "../../../ContentExport";

function DoctorSpecialty({ pid, did }) {
    const [specialties, setSpecialties] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${ip.address}/api/doctor/api/specialties`)
            .then((res) => {
                // console.log("API Response:", res.data);
                const data = res.data.specialties;  // Extract the array from the response object
                if (Array.isArray(data)) {
                    setSpecialties(data);  // Set the state with the extracted array
                } else {
                    console.error("Expected an array but received:", data);
                    setSpecialties([]);  // Handle unexpected response structure
                }
            })
            .catch((err) => {
                console.log("API call failed:", err);
                setSpecialties([]);  // Handle errors gracefully
            });
    }, []);

    const handleSpecialtyClick = (specialtyName) => {
        navigate(`/choosedoctor/${specialtyName.toLowerCase().replace(/\s+/g, '-')}`);
    };

    return (
        <>
            <Container>
                <h4 style={{ marginLeft: '15px', marginTop: '2rem' }}>List of Specialties</h4>
            </Container>
            <Container className="ds-container">
                {specialties.length > 0 ? (
                    specialties.map((specialty, index) => (
                        <div
                            key={index}
                            className="specialtyButtonStyle"
                            onClick={() => handleSpecialtyClick(specialty.name)}
                        >
                            <div className="ds-imgcontainer">
                                <img
                                    src={`${ip.address}/${specialty.imageUrl}`}
                                    alt={specialty.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <p style={{ fontWeight: '600', textAlign: 'center' }}>{specialty.name}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No specialties available</p>
                )}
            </Container>
        </>
    );
}

export default DoctorSpecialty;
