import {  useParams  } from "react-router-dom";



import PatientNavBar from "../PatientNavBar/PatientNavBar";
import PatientInformationSidebar from "./Sidebar/PatientInformationSidebar";


function MainPatientInformation() {
    
    const { pid } = useParams(); 

  
 
    return (
        <>
                <PatientNavBar/>
                <PatientInformationSidebar pid={pid}/>    
        </>
    );
}

export default MainPatientInformation;
