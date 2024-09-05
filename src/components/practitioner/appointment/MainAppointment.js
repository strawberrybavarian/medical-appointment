import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Nav, Container } from 'react-bootstrap';
import './Appointment.css';

import TodaysAppointment from "./TodaysAppointment";
import UpcomingAppointment from "./UpcomingAppointment";
import CompletedAppointment from "./CompletedAppointment";
import OngoingAppointment from "./OngoingAppointment";

const MyPatientsNav = () => {
  const { did } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [allAppointments, setAllAppointments] = useState([]);

  // Get the innerTab from the URL query params
  const innerTabFromUrl = new URLSearchParams(location.search).get("innerTab") || "upcoming";

  useEffect(() => {
    axios
      .get(`http://localhost:8000/doctor/appointments/${did}`)
      .then((res) => {
        setAllAppointments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  // Handle tab selection and update the query parameter in the URL
  const handleSelect = (selectedKey) => {
    // Maintain the outerTab while changing the innerTab in the URL
    const outerTab = new URLSearchParams(location.search).get("outerTab") || "mypatients";
    navigate(`?outerTab=${outerTab}&innerTab=${selectedKey}`);
  };

  return (
    <>
      <div className="white-background p-4" style={{ overflowY: "hidden" }}>
        <Container className="d-flex justify-content-center">
          <Nav
            fill
            variant="tabs"
            className="app-navtabs-doctor"
            activeKey={innerTabFromUrl}
            onSelect={handleSelect}
          >
            <Nav.Item>
              <Nav.Link eventKey="upcoming">Upcoming</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="todays">Today's</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="ongoing">Ongoing</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="completed">Completed</Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>

        {/* Render components based on the innerTab */}
        {innerTabFromUrl === "upcoming" && <UpcomingAppointment allAppointments={allAppointments} />}
        {innerTabFromUrl === "todays" && <TodaysAppointment allAppointments={allAppointments} />}
        {innerTabFromUrl === "ongoing" && <OngoingAppointment allAppointments={allAppointments} />}
        {innerTabFromUrl === "completed" && <CompletedAppointment allAppointments={allAppointments} />}
      </div>
    </>
  );
};

export default MyPatientsNav;
