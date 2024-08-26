import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import './Appointment.css';
import SidebarMenu from "../sidebar/SidebarMenu";
import Nav from 'react-bootstrap/Nav';

import TodaysAppointment from "./TodaysAppointment";
import UpcomingAppointment from "./UpcomingAppointment";
import CompletedAppointment from "./CompletedAppointment";
import OngoingAppointment from "./OngoingAppointment";

const MyPatientsNav = () => {
  const { did } = useParams();
  const [allAppointments, setAllAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

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

  return (
    <>
      <div style={{ padding: "20px", overflowY: "auto", overflowX: "hidden" }} className="container1 container-fluid">
        <h1 className="removegutter dashboard-title">My Patients</h1>
        <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
          <Nav fill variant="tabs" defaultActiveKey="/home">
            <Nav.Item>
              <Nav.Link onClick={() => setActiveTab("upcoming")}>Upcoming Appointment</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link onClick={() => setActiveTab("todays")}>Today's Appointment</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link onClick={() => setActiveTab("ongoing")}>Ongoing Appointment</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link onClick={() => setActiveTab("completed")}>Completed Appointment</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="disabled" disabled>
                Disabled
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        {activeTab === "upcoming" && <UpcomingAppointment allAppointments={allAppointments} />}
        {activeTab === "todays" && <TodaysAppointment allAppointments={allAppointments} />}
        {activeTab === "ongoing" && <OngoingAppointment allAppointments={allAppointments} />}
        {activeTab === "completed" && <CompletedAppointment allAppointments={allAppointments} />}
        
      
      </div>
    </>
  );
};

export default MyPatientsNav;
