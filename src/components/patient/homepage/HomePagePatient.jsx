import { Carousel, Container } from 'react-bootstrap';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import './HomePagePatient.css';
import DoctorSpecialty from './DoctorSpecialty';
import DoctorCarousel from './DoctorCarousel';
import { usePatient } from '../PatientContext';

function HomePagePatient() {
  const { patient } = usePatient(); // Get patient data from context

  if (!patient) {
    return <p>Loading...</p>;
  }

  const fullName = `${patient.patient_firstName} ${patient.patient_lastName}`;

  return (
    <>
      <PatientNavBar pid={patient._id} />
      <Container fluid className='maincolor-container' style={{ overflowY: 'scroll', height: '100vh', paddingBottom: '80px', paddingTop: '1.5rem' }}>
        <Container className='d-flex mb-3'>
          <div>
            <h1>Hello, {fullName}</h1>
            <p>Welcome to the homepage</p>
          </div>
        </Container>
        <DoctorCarousel pid={patient._id} />
        <DoctorSpecialty pid={patient._id} />
      </Container>
    </>
  );
}

export default HomePagePatient;
