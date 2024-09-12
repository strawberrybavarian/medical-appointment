
import React from 'react'
import SidebarMenu from '../sidebar/SidebarMenu'
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Table from 'react-bootstrap/Table';

import './MainInformation.css'; 
import {Container} from 'react-bootstrap';
import PractitionerNavBar from './navbar/PractitionerNavBar';
import DoctorNavbar from '../navbar/DoctorNavbar';
function MainInformation() {

  const { did,pid } = useParams();

    const [allAppointments, setAllAppointments] = useState([]);
    const [theId, setTheId] = useState("");
    const [theName, setTheName] = useState("");
    const [theImage, setTheImage] = useState("");
    const [activeTab, setActiveTab] = useState("pending");
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    useEffect(() => {
      axios
        .get(`http://localhost:8000/doctor/api/finduser/` + did)
        .then((res) => {
          setTheId(res.data.theDoctor._id);
          setTheName(res.data.theDoctor.dr_firstName);
          setTheImage(res.data.theDoctor.dr_image || defaultImage)
        })
        .catch((err) => {
          console.log(err);
        });
  
      axios
        .get(`http://localhost:8000/doctor/appointments/` + did)
        .then((res) => {
          setAllAppointments(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }, [did]);
  
  return (
    <>


         
          <div className="maincolor-container d-flex justify-content-center" style={{ display: "flex" }}>            
            
            <SidebarMenu doctor_image={theImage} doctor_name={theName} did={did} />
              <div style={{ width: '100%' }}>
                <DoctorNavbar doctor_image={theImage}/> 
                <Container fluid className="ad-container" style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', padding: '20px', paddingBottom:'50px' }}>
                  <PractitionerNavBar/>
                </Container>
                
              
                
              </div>
          </div>
         

          
    </>
  )
}

export default MainInformation