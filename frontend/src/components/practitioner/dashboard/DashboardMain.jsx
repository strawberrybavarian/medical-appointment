import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PostAnnouncement from "./PostAnnouncement";
import Dashboard from "./Dashboard";
import "./Dashboard.css";
import DoctorNavbar from "../navbar/DoctorNavbar";
import Footer from "../../Footer";
import { ip } from "../../../ContentExport";

import { useUser } from "../../UserContext";
function DashboardMain() {
  const location = useLocation();
  const { user } = useUser(); // Access doctor data from context
  const [doctorData, setDoctorData] = useState({
    id: "",
    name: "",
    image: "images/014ef2f860e8e56b27d4a3267e0a193a.jpg",
  });
  console.log("Doctor data:", user);
  const navigate = useNavigate();
  const did = user._id; // Safe to access now, since we returned if doctor was null
  useEffect(() => {
    axios
      .get(`${ip.address}/api/doctor/api/finduser/${did}`)
      .then((res) => {
        const { _id, dr_firstName, dr_lastName, dr_middleInitial, dr_image } = res.data.theDoctor;
        const fullName = dr_firstName + " " + (dr_middleInitial ? dr_middleInitial + ". " : "") + dr_lastName;
        setDoctorData({
          id: _id,
          name: fullName,
          image: dr_image || doctorData.image,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);
  // If no doctor session, redirect or show placeholder
  // if (!doctor) {
  //   console.log("No doctor session found; redirecting to /medapp/login.");
  //   navigate("/medapp/login");
  //   return null; 
  //   /*
  //     Alternatively, return <div>Loading or Access Denied</div> 
  //     if you want a placeholder instead of immediate redirect.
  //   */
  // }





  const navigateToAppointment = () => {
    const outerTab = "mypatients";
    navigate(`/mainappointment?outerTab=${outerTab}`, { state: { did } });
  };

  return (
    <div className="d-flex justify-content-center m-0 p-0">
      <SidebarMenu doctor_image={doctorData.image} doctor_name={doctorData.name} did={did} />
      <div style={{ width: "100%" }}>
        <Container
          fluid
          className="cont-fluid-no-gutter  m-0 p-0"
          style={{ overflowY: "scroll", height: "100vh", paddingBottom: "100px", paddingTop: "1.5rem" }}
        >
                  <DoctorNavbar doctor_image={doctorData.image} did={did} />

          <div className="w-100 d-flex justify-content-center mt-5 position-relative">
            <div className="position-relative">
              <img
                className="img-fluid dm-photo shadow-lg"
                src={`${ip.address}/images/Dashboard-Photo.png`}
                alt="Dashboard"
              />
              <div className="overlay-content position-absolute top-50 start-0 translate-middle-y text-start p-4">
                <p className="fs-3 fs-md-4 fs-sm-5 text-white">Welcome!</p>
                <p className="fs-2 fs-md-3 fs-sm-4 text-white">{doctorData.name}</p>
                <p className="fs-6 fs-md-6 fs-sm-7 text-white mb-4">
                  Here you can manage your appointments, view your patients, and post announcements.
                </p>
                <button className="btn btn-primary" onClick={navigateToAppointment}>
                  View your Appointments
                </button>
              </div>
            </div>
          </div>

          <div className="maincolor-container">
            <div className="content-area d-flex justify-content-center px-5">
              <Row className=" d-flex justify-content-center px-5 mt-3">
                <Col md={5} className=" mb-3">
                  <h4 className="mb-3">Status</h4>
                  <hr />
                  <Dashboard doctor_image={doctorData.image} doctor_name={doctorData.name} did={did} />
                </Col>
                <Col md={7}>
                  <h4 className="mb-3">Annoucements</h4>
                  <hr />
                  <PostAnnouncement
                    doctor_image={doctorData.image}
                    doctor_name={doctorData.name}
                    did={did}
                  />
                </Col>
              </Row>
            </div>


          </div>
        </Container>
      </div>
    </div>
  );
}

export default DashboardMain;
