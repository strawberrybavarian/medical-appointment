import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SidebarMenu from "../sidebar/SidebarMenu";
import { Button, Form, Row, Col } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import ImageUploadModal from "./modal/ImageUploadModal";
import UpdateInfoModal from "./modal/UpdateInfoModal";
import './AccountInfo.css';

const AccountInfo = () => {
  const { did } = useParams();
  const [doctorData, setDoctorData] = useState({
    theId: "",
    theName: "",
    theImage: "images/014ef2f860e8e56b27d4a3267e0a193a.jpg", 
    theLastName: "",
    theMI: "",
    email: "",
    cnumber: "",
    password: "",
    dob: "",
    specialty: ""
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/finduser/${did}`)
      .then((res) => {
        const data = res.data.theDoctor;
        setDoctorData({
          theId: data._id,
          theName: data.dr_firstName,
          theImage: data.dr_image || doctorData.theImage,
          theLastName: data.dr_lastName,
          theMI: data.dr_middleInitial,
          email: data.dr_email,
          cnumber: data.dr_contactNumber,
          dob: data.dr_dob,
          password: data.dr_password,
          specialty: data.dr_specialty
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  const openImageModal = () => {
    setIsModalOpen(true);
  };

  const closeImageModal = (newImageUrl) => {
    setIsModalOpen(false);
    if (newImageUrl) {
      setDoctorData(prevState => ({
        ...prevState,
        theImage: newImageUrl
      }));
    }
  };

  const handleUpdate = (updatedData) => {
    axios.put(`http://localhost:8000/doctor/api/${did}/updateDetails`, updatedData)
      .then((response) => {
        console.log('Information updated successfully:', response.data);
        const data = response.data.updatedDoctor;
        setDoctorData({
          theId: data._id,
          theName: data.dr_firstName,
          theImage: data.dr_image || doctorData.theImage,
          theLastName: data.dr_lastName,
          theMI: data.dr_middleInitial,
          email: data.dr_email,
          cnumber: data.dr_contactNumber,
          dob: data.dr_dob,
          password: data.dr_password,
          specialty: data.dr_specialty
        });
        setIsUpdateModalOpen(false);
      })
      .catch((error) => {
        console.error('Error updating information:', error);
      });
  };

  return (
    <>
      <div style={{display: "flex", flex: "1 0 auto", height: "100vh", overflowY: "hidden"}}>
        <div style={{ padding: "20px", paddingBottom: '100px', overflowY: "auto", overflowX: "hidden" }} className="container1 container-fluid ">
          <h1 className="removegutter dashboard-title">Account Information</h1>
          <hr className=" divider d-lg" />
          <div className="ai-container">
            <div className="ai-image-wrapper">
              <img src={`http://localhost:8000/${doctorData.theImage}`} alt="Doctor" className="ai-image" />
              <button className="ai-upload-button" onClick={openImageModal}><Icon.Upload/></button>
            </div>
          </div>
          <div className="ai-container2">
            <Form>
              <Form.Group controlId="exampleForm.ControlInput1">
                <Form.Label>First Name:</Form.Label>
                <Form.Control value={doctorData.theName} disabled />
              </Form.Group>
              <div className="justify-content-end">
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Last Name:</Form.Label>
                    <Form.Control value={doctorData.theLastName} disabled />
                  </Form.Group>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Middle Initial:</Form.Label>
                    <Form.Control value={doctorData.theMI} disabled /> 
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control value={doctorData.email} disabled />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Birthdate:</Form.Label>
                    <Form.Control value={new Date(doctorData.dob).toLocaleDateString()} disabled />
                  </Form.Group>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Contact Number:</Form.Label>
                    <Form.Control value={doctorData.cnumber} disabled /> 
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control type="password" value={doctorData.password} disabled /> 
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Specialty:</Form.Label>
                    <Form.Control value={doctorData.specialty} disabled /> 
                  </Form.Group>
                </Row>
              </div>
              <div style={{textAlign: "center", marginTop: '20px'}}>
                <Button variant="primary" onClick={() => setIsUpdateModalOpen(true)}>
                  Update your Information
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <ImageUploadModal 
        isOpen={isModalOpen}
        onRequestClose={closeImageModal}
      />
      <UpdateInfoModal
        show={isUpdateModalOpen}
        handleClose={() => setIsUpdateModalOpen(false)}
        doctorData={doctorData}
        handleUpdate={handleUpdate}
      />
    </>
  );
};

export default AccountInfo;
