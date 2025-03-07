import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Form, Row, Col, Collapse, Card, Container } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import ImageUploadModal from "./modal/ImageUploadModal";
import UpdateInfoModal from "./modal/UpdateInfoModal";
import ChangePasswordModal from "./modal/ChangePasswordModal";
import './AccountInfo.css';
import DoctorBiography from "./DoctorBiography";
import { ip } from "../../../ContentExport";
import TwoFactorAuth from "../../patient/patientinformation/TwoFactorAuth/TwoFactorAuth";
import DoctorManageHMO from "./DoctorManageHMO";
import { useUser } from "../../UserContext";

const AccountInfo = () => {
  const location = useLocation();
  const { user } = useUser();
  const did = user._id;
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
    specialty: "",
    role:'',
  });
  const [fullname, setFullname] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [showTwoFactorAuthModal, setShowTwoFactorAuthModal] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [hmoCollapseOpen, setHmoCollapseOpen] = useState(false);
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
          specialty: data.dr_specialty,
          role: data.role
        });

        setTwoFaEnabled(data.twoFactorEnabled);
        setFullname(`${data.dr_firstName} ${data.dr_middleInitial}. ${data.dr_lastName}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  const handleEnableDisableTwoFa = async () => {
    if (twoFaEnabled) {
      try {
        const response = await axios.post(`${ip.address}/api/disable-2fa`, { 
          userId: did, 
          role: doctorData.role 
        });
        if (response.data.message === '2FA disabled successfully') {
          setTwoFaEnabled(false);
          alert('2FA Disabled Successfully');
        }
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        alert('Error disabling 2FA');
      }
    } else {
      setShowTwoFactorAuthModal(true);
    }
  };

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
    return `${maskedUser}@${maskedDomainName}.${domainExtension}`;
  };

  return (
    <>
      <div className="docInfoMain w-100">
        <Container fluid className="docInfoContainer w-100 py-4">
          <div className="docInfoHeader w-100">
            <div className="docInfoTitleWrapper">
              <h3 className="docInfoTitle">Doctor Account</h3>
              <p className="docInfoSubtitle">Manage your professional profile and settings</p>
            </div>
          </div>

          <div className="docInfoContent w-100">
            {/* Profile Card */}
            <Card className="docInfoProfileCard w-100">
              <Card.Body>
                <div className="docInfoProfileWrapper">
                  <div className="docInfoAvatarContainer">
                    <div className="docInfoAvatarWrapper">
                      <img 
                        src={`${ip.address}/${doctorData.theImage}`} 
                        alt="Doctor profile"
                        className="docInfoAvatar"
                      />
  
                    </div>
                  </div>
                  
                  <div className="docInfoProfileDetails">
                    <h4 className="docInfoName">{fullname}</h4>
                    <div className="docInfoSpecialty">{doctorData.specialty || 'No specialty listed'}</div>
                    <div className="docInfoBadge">Doctor</div>

                    <div className="docInfoActionButtons">

                    <Button 
               
                        onClick={openImageModal}
                      >
                        <Icon.PencilSquare /> Update Profile Picture
                      </Button>
                      <Button 
                        variant={twoFaEnabled ? "outline-danger" : "outline-success"}
                        className="docInfoSecurityBtn"
                        onClick={handleEnableDisableTwoFa}
                      >
                        {twoFaEnabled ? 
                          <><Icon.ShieldLock /> Disable 2FA</> : 
                          <><Icon.ShieldPlus /> Enable 2FA</>
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Doctor Biography Card */}
            <Card className="docInfoDetailsCard w-100">
              <Card.Header className="docInfoSectionHeader">
                <div className="docInfoSectionHeaderTitle">
                  <Icon.FileEarmarkPerson className="docInfoSectionIcon" />
                  <h5 className="mb-0">Doctor Profile</h5>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setBiographyCollapseOpen(!biographyCollapseOpen)}
                  aria-controls="biography-collapse"
                  aria-expanded={biographyCollapseOpen}
                  className="docInfoCollapseBtn"
                >
                  {biographyCollapseOpen ? <Icon.DashLg /> : <Icon.PlusLg />}
                </Button>
              </Card.Header>
              <Collapse in={biographyCollapseOpen}>
                <div className="w-100">
                  <Card.Body>
                    <DoctorBiography biography={doctorData.biography} did={doctorData.theId} />
                  </Card.Body>
                </div>
              </Collapse>
            </Card>

            {/* HMO Card */}
            <Card className="docInfoDetailsCard w-100">
              <Card.Header className="docInfoSectionHeader">
                <div className="docInfoSectionHeaderTitle">
                  <Icon.Building className="docInfoSectionIcon" />
                  <h5 className="mb-0">HMO Accreditation</h5>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setHmoCollapseOpen(!hmoCollapseOpen)}
                  aria-controls="hmo-collapse"
                  aria-expanded={hmoCollapseOpen}
                  className="docInfoCollapseBtn"
                >
                  {hmoCollapseOpen ? <Icon.DashLg /> : <Icon.PlusLg />}
                </Button>
              </Card.Header>
              <Collapse in={hmoCollapseOpen}>
                <div className="w-100">
                  <Card.Body>
                    <DoctorManageHMO doctorId={doctorData.theId} />
                  </Card.Body>
                </div>
              </Collapse>
            </Card>

            {/* Personal Information Card */}
            <Card className="docInfoDetailsCard w-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                  <h5 className="docInfoSectionTitle">
                    <Icon.Person className="docInfoSectionIcon" />
                    Personal Information
                  </h5>
                  <div className="docInfoPersonalActions">
                    <Button 
                      variant="primary" 
                      className="docInfoEditBtn me-2"
                      onClick={() => setIsUpdateModalOpen(true)}
                    >
                      <Icon.PencilFill /> Update Information
                    </Button>
                    <Button 
                      variant="light" 
                      className="docInfoPasswordBtn"
                      onClick={() => setIsChangePasswordModalOpen(true)}
                    >
                      <Icon.LockFill /> Change Password
                    </Button>
                  </div>
                </div>
                
                <div className="docInfoFormContainer w-100">
                  <div className="docInfoRow">
                    <div className="docInfoField">
                      <label className="docInfoLabel">First Name</label>
                      <div className="docInfoValue">{doctorData.theName}</div>
                    </div>
                    
                    <div className="docInfoField">
                      <label className="docInfoLabel">Last Name</label>
                      <div className="docInfoValue">{doctorData.theLastName}</div>
                    </div>
                    
                    <div className="docInfoField">
                      <label className="docInfoLabel">Middle Initial</label>
                      <div className="docInfoValue">{doctorData.theMI || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="docInfoDivider"></div>
                  
                  <h5 className="docInfoSectionTitle">
                    <Icon.Envelope className="docInfoSectionIcon" />
                    Contact Information
                  </h5>
                  
                  <div className="docInfoRow">
                    <div className="docInfoField docInfoFieldWide">
                      <label className="docInfoLabel">Email Address</label>
                      <div className="docInfoValue">{maskEmail(doctorData.email)}</div>
                    </div>
                  </div>
                  
                  <div className="docInfoRow">
                    <div className="docInfoField">
                      <label className="docInfoLabel">Date of Birth</label>
                      <div className="docInfoValue">
                        {doctorData.dob ? new Date(doctorData.dob).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric', 
                          year: 'numeric'
                        }) : 'Not provided'}
                      </div>
                    </div>
                    
                    <div className="docInfoField">
                      <label className="docInfoLabel">Contact Number</label>
                      <div className="docInfoValue">{doctorData.cnumber || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="docInfoDivider"></div>
                  
                  <h5 className="docInfoSectionTitle">
                    <Icon.Award className="docInfoSectionIcon" />
                    Professional Information
                  </h5>
                  
                  <div className="docInfoRow">
                    <div className="docInfoField docInfoFieldWide">
                      <label className="docInfoLabel">Medical Specialty</label>
                      <div className="docInfoValue">{doctorData.specialty || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>

      {/* Modals */}
      {showTwoFactorAuthModal && (
        <TwoFactorAuth 
          show={showTwoFactorAuthModal} 
          handleClose={() => setShowTwoFactorAuthModal(false)} 
        />
      )}

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
      
      <style jsx>{`
       
      `}</style>
    </>
  );
};

export default AccountInfo;