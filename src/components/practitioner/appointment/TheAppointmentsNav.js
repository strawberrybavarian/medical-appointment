import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Nav, Container } from 'react-bootstrap';
import SidebarMenu from "../sidebar/SidebarMenu";
import MainAppointment from "./MainAppointment";
import MyPendingAppointment from "./MyPendingAppointment";
import './Appointment.css';
import DoctorNavbar from '../navbar/DoctorNavbar';

const TheAppointmentsNav = () => {
  const { did } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [allAppointments, setAllAppointments] = useState([]);
  const [theId, setTheId] = useState("");
  const [theName, setTheName] = useState("");
  const [theImage, setTheImage] = useState("");
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  // Extract the outerTab from the URL query params
  const outerTabFromUrl = new URLSearchParams(location.search).get("outerTab") || "pending";

  useEffect(() => {
    axios
      .get(`http://localhost:8000/doctor/api/finduser/` + did)
      .then((res) => {
        setTheId(res.data.theDoctor._id);
        setTheName(res.data.theDoctor.dr_firstName);
        setTheImage(res.data.theDoctor.dr_image || defaultImage);
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

  const handleUpdateAppointments = (updatedAppointments) => {
    setAllAppointments(updatedAppointments);
  };

  const handleSelect = (selectedKey) => {
    // Update the URL with the outer tab
    navigate(`?outerTab=${selectedKey}`);
  };

  return (
    <div className="maincolor-container" style={{ display: "flex" }}>
      <SidebarMenu doctor_image={theImage} doctor_name={theName} did={theId} />
      <div style={{ width: '100%' }}>
        <DoctorNavbar doctor_image={theImage} />

        <Container>
          <Nav fill variant="tabs" className="navtabs-pxmanagement" activeKey={outerTabFromUrl} onSelect={handleSelect}>
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
