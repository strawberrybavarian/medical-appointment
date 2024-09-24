import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PostAnnouncement from "./PostAnnouncement";
import Dashboard from "./Dashboard";
import "./Dashboard.css";
import DoctorNavbar from "../navbar/DoctorNavbar";

function DashboardMain() {
  const location = useLocation();
  const { did } = location.state || {};  // Get 'did' from the state passed via navigation
  const [doctorData, setDoctorData] = useState({
    id: "",
    name: "",
    image: "images/014ef2f860e8e56b27d4a3267e0a193a.jpg",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!did) {
      // If no 'did' is found in state, redirect back or handle error
      navigate('/');
      return;
    }

    axios.get(`http://localhost:8000/doctor/api/finduser/${did}`)
      .then((res) => {
        const { _id, dr_firstName, dr_lastName, dr_middleInitial ,dr_image } = res.data.theDoctor;
        const fullName = dr_firstName + " " + dr_middleInitial + ". " + dr_lastName;
        setDoctorData({ id: _id, name: fullName, image: dr_image || doctorData.image });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  return (
    <div className="maincolor-container d-flex justify-content-center">
      <SidebarMenu doctor_image={doctorData.image} doctor_name={doctorData.name} did={did} />
      <div style={{ width: '100%' }}>
         <DoctorNavbar doctor_image={doctorData.image} did={did}/>
          <Container fluid className="ad-container" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '20px' }}>
            <Dashboard 
              doctor_image={doctorData.image} 
              doctor_name={doctorData.name} 
              did={did}
            />
            <PostAnnouncement doctor_image={doctorData.image} doctor_name={doctorData.name} did={did} />
          </Container> 
      </div>
    </div>
  );
}

export default DashboardMain;
