
import React from 'react'
import SidebarMenu from '../sidebar/SidebarMenu'
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Table from 'react-bootstrap/Table';

import './MainInformation.css'; 
import Nav from 'react-bootstrap/Nav';
import PractitionerNavBar from './navbar/PractitionerNavBar';
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


         
          <div style={{display: "flex", flex: "1 0 auto", height: "100vh", overflowY: "hidden"}} className='mi-navside'>
            <SidebarMenu doctor_image={theImage} doctor_name={theName} did={theId} />
              <div className="mi-container"> 
                <PractitionerNavBar/>
              </div>
          </div>
         

          
    </>
  )
}

export default MainInformation