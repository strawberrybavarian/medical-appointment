import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PostAnnouncement from "./PostAnnouncement";
import Dashboard from "./Dashboard";
import "./Dashboard.css";

function DashboardMain() {
  const { did } = useParams();
  const [doctorData, setDoctorData] = useState({
    id: "",
    name: "",
    image: "images/014ef2f860e8e56b27d4a3267e0a193a.jpg",
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/finduser/${did}`)
      .then((res) => {
        const { _id, dr_firstName, dr_image } = res.data.theDoctor;
        setDoctorData({ id: _id, 
                        name: dr_firstName, 
                        image: dr_image || doctorData.image });
        })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  return (
    <div style={{ display: "flex", flex: "1 0 auto", height: "100vh", overflowY: "hidden"}}>
      <SidebarMenu doctor_image={doctorData.image} doctor_name={doctorData.name} did={doctorData.id}/>
      <Container className="overflow-y-scroll" xxl={2}>
        <Dashboard />
        <PostAnnouncement />
      </Container>
    </div>
  );
}

export default DashboardMain;
