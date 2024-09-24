import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Nav, Container } from 'react-bootstrap';
import SidebarMenu from "../sidebar/SidebarMenu";
import MainAppointment from "./MainAppointment";
import MyPendingAppointment from "./MyPendingAppointment";
import './Appointment.css';
import DoctorNavbar from '../navbar/DoctorNavbar';

const TheAppointmentsNav = () => {
  const location = useLocation();
  const { did } = location.state || {};
  const navigate = useNavigate();
  
  // Use hooks without conditions
  const [allAppointments, setAllAppointments] = useState([]);
  const [theId, setTheId] = useState("");
  const [theName, setTheName] = useState("");
  const [theImage, setTheImage] = useState("");
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  

  // Extract the outerTab from the URL query params
  const outerTabFromUrl = new URLSearchParams(location.search).get("outerTab") || "pending";

  // Always call useEffect
  useEffect(() => {
    if (!did) {
      // Move the conditional logic into the useEffect
      navigate('/'); // If `did` is missing, redirect to home or login
      return;
    }

    axios
      .get(`http://localhost:8000/doctor/api/finduser/${did}`)
      .then((res) => {
        setTheId(res.data.theDoctor._id);
        setTheName(res.data.theDoctor.dr_firstName);
        setTheImage(res.data.theDoctor.dr_image || defaultImage);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`http://localhost:8000/doctor/appointments/${did}`)
      .then((res) => {
        setAllAppointments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did, navigate]);

  const handleUpdateAppointments = (updatedAppointments) => {
    setAllAppointments(updatedAppointments);
  };

  const handleSelect = (selectedKey) => {
    // Update the URL with the outer tab and pass `did` in state
    navigate(`?outerTab=${selectedKey}`, { state: { did } });
  };

  // If `did` is not available, render nothing (you can replace this with a loading spinner or error message)
  if (!did) {
    return null;
  }

  return (
    <div className="maincolor-container" style={{ display: "flex" }}>
      <SidebarMenu doctor_image={theImage} doctor_name={theName} did={did} outerTab={outerTabFromUrl} />
      <div style={{ width: '100%' }}>
        <DoctorNavbar doctor_image={theImage} />

        <Container>
          <Nav fill variant="tabs" className="app-navtabs-doctor" activeKey={outerTabFromUrl} onSelect={handleSelect}>
            <Nav.Item>
              <Nav.Link eventKey="pending">Pending Appointments</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="mypatients">My Patients</Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>

        <Container className="pt-5 white-container">
          {outerTabFromUrl === 'pending' && (
            <MyPendingAppointment appointments={allAppointments} onUpdate={handleUpdateAppointments} />
          )}
          {outerTabFromUrl === 'mypatients' && <MainAppointment />}
        </Container>
      </div>
    </div>
  );
};

export default TheAppointmentsNav;
