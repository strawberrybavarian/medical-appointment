import { Carousel, Container } from 'react-bootstrap';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import Image1 from './images/Jeno.jpg';
import Image2 from './images/Mark.jpg';
import Image3 from './images/Sohee.jpg';
import './HomePagePatient.css';
import DoctorSpecialty from './DoctorSpecialty';
import { useLocation, useParams } from 'react-router-dom';
import DoctorCarousel from './DoctorCarousel';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ip } from '../../../ContentExport';


function HomePagePatient() {
  const location = useLocation();
  const {pid} = location.state || {};
//  const { pid } = useParams();
 console.log(pid);

const [patient, setPatient] = useState(null);
const [fullName, setFullName] = useState('');

useEffect(() => {
  const fetchPatient = async () => {
    try {
      const response = await axios.get(`${ip.address}/patient/api/onepatient/${pid}`);
      setPatient(response.data.thePatient);
      const fullName = `${response.data.thePatient.patient_firstName} ${response.data.thePatient.patient_lastName}`;
      setFullName(fullName);
  
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  fetchPatient();
}, [pid]);

 return (
  <>
    <PatientNavBar pid={pid} />
    <Container fluid className='maincolor-container' style={{ overflowY: 'scroll', height: '100vh', paddingBottom: '80px', paddingTop: '1.5rem' }}>
      
      <Container className='d-flex mb-3'>
        {/* <div>
          <h1 style={{ lineHeight: '0.5' }}>Hello, {fullName}</h1>
          <p style={{ lineHeight: '0' }}>Welcome to the homepage</p>
        </div> */}
       
      </Container>
      <DoctorCarousel pid={pid} />
      <DoctorSpecialty pid={pid} />
    </Container>
  </>
);
}

export default HomePagePatient;
