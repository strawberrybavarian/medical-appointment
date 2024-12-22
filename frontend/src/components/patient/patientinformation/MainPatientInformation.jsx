import { useLocation, useParams } from "react-router-dom";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import PatientInformationSidebar from "./Sidebar/PatientInformationSidebar";
import { Container, Row, Col } from "react-bootstrap";
import './MainPatientInformation.css';
import { useUser } from "../../UserContext";

function MainPatientInformation() {
    const { user } = useUser();

    return (
        <>
            <Container fluid className="cont-fluid-no-gutter" style={{ overflowY: 'scroll', height: '100vh' }}>
                <PatientNavBar pid={user._id} />
                
                <Container fluid>
                <PatientInformationSidebar pid={user._id}/>
               
                  
            
                </Container>
               
            </Container>
        </>
    );
}

export default MainPatientInformation;
