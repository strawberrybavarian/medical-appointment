import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import './DoctorSpecialty.css';
import OBGYNE from './images/ObstetricsAndGynecology.png';
import PEDIATRICS from './images/Pedia.png';
import { Container } from "react-bootstrap";
function DoctorSpecialty({ pid, did }) {
    const [specialties, setSpecialties] = useState([]);
    const navigate = useNavigate();
    console.log(`hello`, pid, did);

    useEffect(() => {
        axios.get('http://localhost:8000/doctor/api/specialties')
            .then((res) => {
                setSpecialties(res.data.specialties);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const handleSpecialtyClick = (specialty) => {
        navigate(`/choosedoctor/${specialty.toLowerCase()}`);
    };

    const specialtyImages = {
        "Family Medicine": OBGYNE,
        "Pediatrics": PEDIATRICS,
        "Obstetrics and Gynecology": OBGYNE,
        "Hematology": PEDIATRICS,
        "Urology": OBGYNE,
    };

    const getImage = (specialty) => {
        return specialtyImages[specialty] || null;
    };

    return (
        <>
          
 
        <Container>
            <h4 style={{ marginLeft: '15px', marginTop: '2rem' }}>List of Specialties</h4>
        </Container>
        <Container className="ds-container">
            
            {specialties.map((specialty, index) => (
                <div
                    key={index}
                    className="specialtyButtonStyle"
                    onClick={() => handleSpecialtyClick(specialty)}
                >
                    <div className="ds-imgcontainer">
                        <img src={getImage(specialty)} alt={specialty} style={{ width: '100%', height: '100%', objectFit:'cover' }} />
                    </div>
                    <div>
                        <p style={{fontWeight:'600', textAlign:'center'}}>{specialty}</p>
                    </div>
                </div>
            ))}
        </Container>
 
      </>
    );
}

export default DoctorSpecialty;
