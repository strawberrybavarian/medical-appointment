import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Form, Row, Col, Collapse } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import ImageUploadModal from "./modal/ImageUploadModal";
import UpdateInfoModal from "./modal/UpdateInfoModal";
import ChangePasswordModal from "./modal/ChangePasswordModal"; // Import the ChangePasswordModal component
import './AccountInfo.css';
import { PencilFill } from "react-bootstrap-icons";
import DoctorBiography from "./DoctorBiography";
import { ip } from "../../../ContentExport";
const AccountInfo = () => {
  const location = useLocation();
  const { did } = location.state || {};
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
  const [fullname, setFullname] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false); // State for Change Password modal

  // State to manage biography collapse
  const [biographyCollapseOpen, setBiographyCollapseOpen] = useState(false);

  useEffect(() => {
    axios.get(`${ip.address}/api/doctor/api/finduser/${did}`)
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

        setFullname(`${data.dr_firstName} ${data.dr_middleInitial}. ${data.dr_lastName}`);
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
    axios.put(`${ip.address}/api/doctor/api/${did}/updateDetails`, updatedData)
      .then((response) => {
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

  // Function to mask email
  const maskEmail = (email) => {
    if (!email) return '';
    const [user, domain] = email.split("@");
    const maskedUser = user[0] + "*****" + user.slice(-1);
    const [domainName, domainExtension] = domain.split(".");
    const maskedDomainName = domainName[0] + "***";
    const maskedDomainExtension = domainExtension[0] + "***";
    return `${maskedUser}@${maskedDomainName}.${maskedDomainExtension}`;
  };

  return (
    <>
      <div className="w-100">
        <div className="d-flex justify-content-center ">
          <div className="ai-container d-flex align-items-center shadow-sm">
            <img src={`${ip.address}/${doctorData.theImage}`} alt="Doctor" className="ai-image" />
            <div style={{ marginLeft: '1rem' }} className="d-flex align-items-center justify-content-between w-100">
              <div>
                <h4 className="m-0">{fullname}</h4>
                <p style={{ fontSize: '15px' }}>{doctorData.specialty}</p>
              </div>

              <div>
                <Button onClick={openImageModal}>Upload Image<Icon.Upload style={{ marginLeft: '0.4rem' }} /></Button>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <div className="d-flex justify-content-center">
          <div className="ai-container2 shadow-sm">
            <div className="m-0 p-0 d-flex justify-content-end align-items-center">
              <div className="w-100 d-flex align-items-center">
                <span className="m-0" style={{ fontWeight: 'bold' }}>Doctor Profile</span>
              </div>
              <Link
                onClick={() => setBiographyCollapseOpen(!biographyCollapseOpen)}
                aria-controls="biography-collapse"
                aria-expanded={biographyCollapseOpen}
                className="link-collapse"
              >
                {biographyCollapseOpen ? <span>&#8722;</span> : <span>&#43;</span>}
              </Link>
            </div>

            {/* Collapsible Biography Section */}
            <Collapse in={biographyCollapseOpen}>
              <div id="biography-collapse">
                <DoctorBiography
                  biography={doctorData.biography}
                  did={doctorData.theId}
                />
              </div>
            </Collapse>
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <div className="ai-container2 shadow-sm">
            <div style={{ textAlign: "end", marginTop: '20px' }}>
              <Button variant="primary" onClick={() => setIsUpdateModalOpen(true)} style={{ marginRight: '10px' }}>
                <PencilFill size={14} style={{ marginRight: '0.5rem' }} /> Update your Information
              </Button>
              <Button variant="secondary" onClick={() => setIsChangePasswordModalOpen(true)}>
                Change Password
              </Button>
            </div>
            <Form>
              <Form.Group controlId="exampleForm.ControlInput1">
                <Form.Label>First Name:</Form.Label>
                <Form.Control value={doctorData.theName} disabled />
              </Form.Group>

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
                  <Form.Control value={maskEmail(doctorData.email)} disabled />
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
                  <Form.Label>Specialty:</Form.Label>
                  <Form.Control value={doctorData.specialty} disabled />
                </Form.Group>
              </Row>
            </Form>
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={isModalOpen}
        onRequestClose={closeImageModal}
        did={did}
      />
      <UpdateInfoModal
        show={isUpdateModalOpen}
        handleClose={() => setIsUpdateModalOpen(false)}
        doctorData={doctorData}
        handleUpdate={handleUpdate}
      />
      <ChangePasswordModal
        show={isChangePasswordModalOpen}
        handleClose={() => setIsChangePasswordModalOpen(false)}
        doctorData={doctorData}
      />
    </>
  );
};

export default AccountInfo;
