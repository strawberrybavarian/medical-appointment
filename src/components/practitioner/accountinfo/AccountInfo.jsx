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
  const [theId, setTheId] = useState("");
  const [theName, setTheName] = useState("");
  const [theImage, setTheImage] = useState("");
  const [theLastName, setTheLastName] = useState("");
  const [theMI, setTheMI] = useState("");
  const [email, setEmail] = useState("");
  const [cnumber, setCnumber] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [specialty, setspecialty] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/finduser/${did}`)
      .then((res) => {
        setTheImage(res.data.theDoctor.dr_image || defaultImage);
        setTheId(res.data.theDoctor._id);
        setTheName(res.data.theDoctor.dr_firstName);
        setTheLastName(res.data.theDoctor.dr_lastName);
        setTheMI(res.data.theDoctor.dr_middleInitial);
        setEmail(res.data.theDoctor.dr_email);
        setCnumber(res.data.theDoctor.dr_contactNumber);
        setDob(res.data.theDoctor.dr_dob);
        setPassword(res.data.theDoctor.dr_password)
        setspecialty(res.data.theDoctor.dr_specialty)
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
      setTheImage(newImageUrl);
    }
  };

  const handleUpdate = (updatedData) => {
    axios.put(`http://localhost:8000/doctor/api/${did}/updateDetails`, updatedData)
      .then((response) => {
        console.log('Information updated successfully:', response.data);
        setTheName(response.data.updatedDoctor.dr_firstName);
        setTheLastName(response.data.updatedDoctor.dr_lastName);
        setTheMI(response.data.updatedDoctor.dr_middleInitial);
        setEmail(response.data.updatedDoctor.dr_email);
        setCnumber(response.data.updatedDoctor.dr_contactNumber);
        setDob(response.data.updatedDoctor.dr_dob);
        setPassword(response.data.updatedDoctor.dr_password);
        setspecialty(response.data.updatedDoctor.dr_specialty)
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
              <img src={`http://localhost:8000/${theImage}`} alt="Doctor" className="ai-image" />
              <button className="ai-upload-button" onClick={openImageModal}><Icon.Upload/></button>
            </div>
          </div>
          <div className="ai-container2">
            <Form>
              <Form.Group controlId="exampleForm.ControlInput1">
                <Form.Label>First Name:</Form.Label>
                <Form.Control value={theName} disabled />
              </Form.Group>
              <div className="justify-content-end">
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Last Name:</Form.Label>
                    <Form.Control value={theLastName} disabled />
                  </Form.Group>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Middle Initial:</Form.Label>
                    <Form.Control value={theMI} disabled /> 
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control value={email} disabled />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Birthdate:</Form.Label>
                    <Form.Control value={new Date(dob).toLocaleDateString()} disabled />
                  </Form.Group>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Contact Number:</Form.Label>
                    <Form.Control value={cnumber} disabled /> 
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control type="password" value={password} disabled /> 
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} controlId="exampleForm.ControlInput1">
                    <Form.Label>Specialty:</Form.Label>
                    <Form.Control value={specialty} disabled /> 
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
        doctorData={{
          dr_firstName: theName,
          dr_lastName: theLastName,
          dr_middleInitial: theMI,
          dr_email: email,
          dr_contactNumber: cnumber,
          dr_dob: dob,
          dr_password: password,
          dr_specialty: specialty
        }}
        handleUpdate={handleUpdate}
      />
    </>
  );
};

export default AccountInfo;
