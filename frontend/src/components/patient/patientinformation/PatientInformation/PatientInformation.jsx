import { Row, Col, Form, Container, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';  
import UpdatePatientInfoModal from './UpdatePatientInfoModal';  
import UpdatePatientImageModal from './UpdatePatientImageModal'; 
import './PatientInformation.css';
import * as Icon from "react-bootstrap-icons";
import { ip } from '../../../../ContentExport';
import Footer from '../../../Footer';
import TwoFactorAuth from '../TwoFactorAuth/TwoFactorAuth';

function PatientInformation({ pid }) {
  const [thePatient, setThePatient] = useState();
  const [theName, setTheName] = useState("");
  const [theLastName, setTheLastName] = useState("");
  const [theMI, setTheMI] = useState("");
  const [email, setEmail] = useState("");
  const [cnumber, setCnumber] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [lastProfileUpdate, setLastProfileUpdate] = useState(null);
  const [image, setImage] = useState("images/014ef2f860e8e56b27d4a3267e0a193a.jpg");
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showTwoFactorAuthModal, setShowTwoFactorAuthModal] = useState(false);

  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
      .then((res) => {
        const patientData = res.data.thePatient;
        setThePatient(patientData);
        setTheName(patientData.patient_firstName);
        setTheLastName(patientData.patient_lastName);
        setTheMI(patientData.patient_middleInitial);
        setEmail(patientData.patient_email);
        setCnumber(patientData.patient_contactNumber);
        setDob(patientData.patient_dob);
        setPassword(patientData.patient_password);
        setLastProfileUpdate(new Date(patientData.lastProfileUpdate));
        setImage(patientData.patient_image || "images/default-profile.png");
        setTwoFaEnabled(patientData.twoFactorEnabled);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [pid]);

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) {
      return email;
    }

    const [namePart, domainPart] = email.split("@");
    const maskedName = namePart[0] + "****" + namePart[namePart.length - 1];
    const domainParts = domainPart.split(".");
    const maskedDomain = domainParts[0][0] + "***" + domainParts[0][domainParts[0].length - 1];
    const topLevelDomain = domainParts[1];

    return `${maskedName}@${maskedDomain}.${topLevelDomain}`;
  };

  const handleEnableDisableTwoFa = async () => {
    if (twoFaEnabled) {
      try {
        const response = await axios.post(`${ip.address}/api/disable-2fa`, { 
          userId: pid, 
          role: thePatient.role 
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

  const handleImageUpload = (newImage) => {
    setImage(newImage);
  };

  const canUpdate = () => {
    if (!lastProfileUpdate) {
      return true;
    }

    const currentDate = new Date();
    const daysSinceLastUpdate = Math.floor((currentDate - lastProfileUpdate) / (1000 * 60 * 60 * 24));
    return daysSinceLastUpdate >= 30;
  };

  const handleShowInfoModal = () => {
    if (canUpdate()) {
      setShowInfoModal(true);
    } else {
      alert("You can only update your information every 30 days.");
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setShowInfoModal(false);
    setShowImageModal(false);
  };

  return (
    <>
      <div className="patInfoMain overflow-auto">
        <Container className="patInfoContainer py-4">
          <div className="patInfoHeader">
            <div className="patInfoTitleWrapper">
              <h3 className="patInfoTitle">Account Details</h3>
              <p className="patInfoSubtitle">Manage your personal information</p>
            </div>
          </div>

          <div className="patInfoContent">
            {/* Profile Card */}
            <Card className="patInfoProfileCard">
              <Card.Body>
                <div className="patInfoProfileWrapper">
                  <div className="patInfoAvatarContainer">
                    <div className="patInfoAvatarWrapper">
                      <img 
                        src={`${ip.address}/${image}`} 
                        alt={`${theName}'s profile`}
                        className="patInfoAvatar"
                      />
                      {/* <button 
                        className="patInfoAvatarEditBtn"
                        onClick={() => setShowImageModal(true)}
                      >
                        <Icon.PencilSquare />
                      </button> */}
                    </div>
                  </div>
                  
                  <div className="patInfoProfileDetails">
                    <h4 className="patInfoName">{theName} {theMI && `${theMI}. `}{theLastName}</h4>
                    <div className="patInfoBadge">Patient</div>

                    <div className="patInfoActionButtons">


                    <Button 
                        
                        onClick={() => setShowImageModal(true)}
                      >
                        Update Profile Picture
                      </Button>
                      <Button 
                        variant={twoFaEnabled ? "outline-danger" : "outline-success"}
                        className="patInfoSecurityBtn"
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

            {/* Information Card */}
            <Card className="patInfoDetailsCard">
              <Card.Body>
                <h5 className="patInfoSectionTitle">
                  <Icon.Person className="patInfoSectionIcon" />
                  Personal Information
                </h5>
                
                <div className="patInfoFormContainer">
                  <div className="patInfoRow">
                    <div className="patInfoField">
                      <label className="patInfoLabel">First Name</label>
                      <div className="patInfoValue">{theName}</div>
                    </div>
                    
                    <div className="patInfoField">
                      <label className="patInfoLabel">Last Name</label>
                      <div className="patInfoValue">{theLastName}</div>
                    </div>
                    
                    <div className="patInfoField">
                      <label className="patInfoLabel">Middle Initial</label>
                      <div className="patInfoValue">{theMI || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="patInfoDivider"></div>
                  
                  <h5 className="patInfoSectionTitle">
                    <Icon.Envelope className="patInfoSectionIcon" />
                    Contact Information
                  </h5>
                  
                  <div className="patInfoRow">
                    <div className="patInfoField patInfoFieldWide">
                      <label className="patInfoLabel">Email Address</label>
                      <div className="patInfoValue">{maskEmail(email)}</div>
                    </div>
                  </div>
                  
                  <div className="patInfoRow">
                    <div className="patInfoField">
                      <label className="patInfoLabel">Date of Birth</label>
                      <div className="patInfoValue">
                        {dob ? new Date(dob).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric', 
                          year: 'numeric'
                        }) : 'Not provided'}
                      </div>
                    </div>
                    
                    <div className="patInfoField">
                      <label className="patInfoLabel">Contact Number</label>
                      <div className="patInfoValue">{cnumber || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="patInfoDivider"></div>
                  
                  <div className="patInfoActions">
                    <Button 
                      variant="primary" 
                      className="patInfoEditBtn"
                      onClick={handleShowInfoModal}
                    >
                      <Icon.PencilFill /> Edit Information
                    </Button>
                    <Button 
                      variant="light" 
                      className="patInfoPasswordBtn"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <Icon.LockFill /> Change Password
                    </Button>
                  </div>
                  
                  {!canUpdate() && lastProfileUpdate && (
                    <div className="patInfoUpdateNote">
                      <Icon.InfoCircle /> You can update your information again in {
                        30 - Math.floor((new Date() - new Date(lastProfileUpdate)) / (1000 * 60 * 60 * 24))
                      } days.
                    </div>
                  )}
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

      <ChangePasswordModal
        show={showPasswordModal}
        handleClose={handleCloseModal}
        pid={pid}
        email={email}
        password={password}
      />
      
      <UpdatePatientInfoModal
        show={showInfoModal}
        handleClose={handleCloseModal}
        thePatient={thePatient}
        pid={pid}
      />
      
      <UpdatePatientImageModal
        show={showImageModal}
        handleClose={handleCloseModal}
        pid={pid}
        onImageUpload={handleImageUpload}
      />
      

    </>
  );
}

export default PatientInformation;