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
            <div >
                    <PatientNavBar pid={user._id} />
                
             
           
                            <PatientInformationSidebar pid={user._id}/>
                 
      
            </div>
        </>
    );
}

export default MainPatientInformation;
