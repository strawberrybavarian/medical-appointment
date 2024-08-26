import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { CDBCard, CDBBadge } from "cdbreact";
import "./Dashboard.css";

import * as Icon from "react-bootstrap-icons";

import { Dropdown } from "react-bootstrap";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  //to store the state
  const { did, role } = useParams();

  const [thePost, setThePost] = useState([]);

  const [postDropdowns, setPostDropdowns] = useState([]);
  const [thePosts, setThePosts] = useState([]);
  const [theImage, setTheImage] = useState ("");
  const [theId, setTheId] = useState("");
  const [theName, setTheName] = useState("");
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const navigate = useNavigate();
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";


  return (

 <>

      
     
            <h1 className="dashboard-title">Dashboard</h1>
            <p>Overview</p>
    

          <Container className="container-fluid d-lg-inline-flex removegutter cc1 cont ">
            <CDBCard className="compact-card cc1 m-2 " title="11.8M">
              <p className="ccp1">Total Patient</p>
              <Container className="d-flex align-items-center justify-content-between">
                <h2 className="cch2 mb-0">10000</h2>
                <CDBBadge
                  size="small"
                  borderType="pill"
                  className="btn1 ms-2 mb-0 d-flex align-items-center"
                >
                  <p className="mb-0 mx-auto">+2.5</p>
                </CDBBadge>
              </Container>
            </CDBCard>
            <CDBCard className="compact-card cc1 m-2  " title="11.8M">
              <p className="ccp1">New Patient</p>
              <Container className="d-flex align-items-center justify-content-between">
                <h2 className="cch2 mb-0">10000</h2>
                <CDBBadge
                  size="small"
                  borderType="pill"
                  className="btn1 ms-2 mb-0 d-flex align-items-center"
                >
                  <p className="mb-0 mx-auto">+2.52</p>
                </CDBBadge>
              </Container>
            </CDBCard>
            <CDBCard className="compact-card cc1 m-2  " title="11.8M">
              <p className="ccp1">Tracked Health</p>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="cch2 mb-0">1234560</h2>
                <CDBBadge
                  size="small"
                  borderType="pill"
                  className="btn1 ms-2 mb-0 d-flex align-items-center"
                >
                  <p className="mb-0 mx-auto">+2.5224</p>
                </CDBBadge>
              </div>
            </CDBCard>
          </Container>

          



     
          </>
    


  );
}

export default Dashboard;
