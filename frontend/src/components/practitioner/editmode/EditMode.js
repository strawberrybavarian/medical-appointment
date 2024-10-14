import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { CDBCard, CDBBadge } from "cdbreact";

import "./EditMode.css";

import * as Icon from "react-bootstrap-icons";


import Nav from 'react-bootstrap/Nav';
import { Container, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ip } from "../../../ContentExport";

function EditMode() {
  const navigate = useNavigate();
  const { uid,index,role } = useParams();
  const [post, setPost] = useState([""]);

  const [theName, setTheName] =useState("");
  axios.get(`${ip.address}/api/doctor/api/finduser/`+uid)
  .then((res) => {

    setTheName(res.data.theDoctor.dr_firstName)
  })
  .catch((err) => {
    console.log(err);
  });

  useEffect(()=>{
    axios.get(`${ip.address}/api/doctor/api/finduser/`+uid)
    .then((res)=>{
        console.log(index);
        console.log(uid);
        console.log(res.data.theDoctor.dr_posts[0]);
        setPost(res.data.theDoctor.dr_posts[index].content)
    })
    .catch((err)=>{
        console.log(err)
    })
},[])


  const updatePost =(uid)=>{
    const newPost ={
      content:post,
    }
    navigate('/dashboard/'+uid);
    axios.put(`${ip.address}/api/doctor/api/post/updatepost/${uid}/${index}`,newPost)
    .then((response)=>{
      console.log(response.data);
      window.location.reload();
      
  })
  .catch((err)=>{
      console.log(err);
  })

  }

  return (
    <>
    <div
      style={{display: "flex", flex: "1 0 auto", height: "100vh", overflowY: "hidden",}}
    >
      <SidebarMenu p_name={theName} />

      <div style={{ padding: "20px", overflowY: "auto", overflowX: "hidden" }} className="container1 container-fluid ">
        <div className=" removegutter container4 container-fluid ">
          <h1 className="dashboard-title">Edit your Post</h1>
          <hr className=" divider d-lg" />
        </div>
        <div>
          <Form>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Control value={post} onChange={(e) => {setPost(e.target.value)}} as="textarea" rows={4} placeholder={post}/>
            </Form.Group>
            <div className="  d-lg-inline-flex removegutter container4 container-fluid justify-content-end ">
              <Button onClick={()=>{updatePost(uid)}} variant="primary" type="submit">
                Update your Post
              </Button>
            </div>
          </Form>
          <hr className=" divider d-lg" />
        </div>


      </div>  

      <div className="container thirdcontainer">

        </div>
    </div>
  </>
  )
}

export default EditMode