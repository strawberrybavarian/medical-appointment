import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import './DoctorSpecialty.css';
import OBGYNE from './images/ObstetricsAndGynecology.png';
import PEDIATRICS from './images/Pedia.png';

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
        navigate(`/${specialty.toLowerCase()}/choosedoctor/${pid}`);
    };

    const specialtyImages = {
        "Obstetrics and Gynecology": OBGYNE,
        "Pediatrics": PEDIATRICS
    };

    const getImage = (specialty) => {
        return specialtyImages[specialty] || null;
    };

    return (
      <div className="ds-main">
        <div className="ds-container">
            {specialties.map((specialty, index) => (
                <div
                    key={index}
                    className="specialtyButtonStyle"
                    onClick={() => handleSpecialtyClick(specialty)}
                >
                    <div className="ds-imgcontainer">
                        <img src={getImage(specialty)} alt={specialty} style={{ width: '50%', height: '50%' }} />
                    </div>
                    <div>
                        <p>{specialty}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
}

export default DoctorSpecialty;
