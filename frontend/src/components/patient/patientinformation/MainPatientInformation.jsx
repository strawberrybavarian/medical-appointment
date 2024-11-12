import { useLocation, useParams } from "react-router-dom";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import PatientInformationSidebar from "./Sidebar/PatientInformationSidebar";
import { usePatient } from "../PatientContext";
import { Container, Row, Col } from "react-bootstrap";
import './MainPatientInformation.css';

function MainPatientInformation() {
    const { patient } = usePatient();

    return (
        <>
            <Container fluid className="cont-fluid-no-gutter" style={{ overflowY: 'scroll', height: '100vh' }}>
                <PatientNavBar pid={patient._id} />
                
                <Container fluid>
                <PatientInformationSidebar pid={patient._id}/>
               
                  
            
                </Container>
               
            </Container>
        </>
    );
}

export default MainPatientInformation;
