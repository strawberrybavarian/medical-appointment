import {  useLocation, useParams  } from "react-router-dom";



import PatientNavBar from "../PatientNavBar/PatientNavBar";
import PatientInformationSidebar from "./Sidebar/PatientInformationSidebar";
import { usePatient } from "../PatientContext";
function MainPatientInformation() {
    const { patient } = usePatient();

 
    return (
        <>
      
                <PatientNavBar pid={patient._id}/>
                <PatientInformationSidebar pid={patient._id}/>    
        </>
    );
}

export default MainPatientInformation;
