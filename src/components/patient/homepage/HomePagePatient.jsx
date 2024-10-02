import { Container } from 'react-bootstrap';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import './HomePagePatient.css';
import DoctorSpecialty from './DoctorSpecialty';
import DoctorCarousel from './DoctorCarousel';
import { usePatient } from '../PatientContext';
import Footer from '../../Footer';
import DoctorServices from './DoctorServices';
import { useNavigate } from 'react-router-dom';
import { ip } from '../../../ContentExport';
function HomePagePatient() {
  const navigate = useNavigate();
  const { patient } = usePatient(); // Get patient data from context

  if (!patient) {
    return navigate('/');
  }

  const fullName = `${patient.patient_firstName} ${patient.patient_lastName}`;

  return (
    <>
      <PatientNavBar pid={patient._id} />
      <Container className='cont-fluid-no-gutter' fluid style={{overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem'}}>
     

  
        <div className="maincolor-container">
          {/* Main Content Area */}
          <div className="content-area">
            <DoctorCarousel fluid className='w-100' pid={patient._id} />
            <DoctorSpecialty fluid className='w-100' pid={patient._id} />
            <DoctorServices fluid className='w-100' pid={patient._id}/>

          
          </div>

          {/* Footer at the bottom */}
          <Container fluid className="footer-container cont-fluid-no-gutter">
            <Footer />
          </Container>
        </div>
      </Container>
    </>
  );
}

export default HomePagePatient;
