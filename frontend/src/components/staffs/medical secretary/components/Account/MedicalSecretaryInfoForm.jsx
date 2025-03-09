import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import UpdateInfoModal from './Modals/UpdateInfoModal';
import ChangePasswordModal from './Modals/ChangePasswordModal';
import TwoFactorAuth from '../../../../patient/patientinformation/TwoFactorAuth/TwoFactorAuth';
import * as Icon from "react-bootstrap-icons";
import './MedicalSecretaryInfoForm.css';

const MedicalSecretaryInfoForm = ({ msid }) => {
  const [medSecData, setMedSecData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showTwoFactorAuthModal, setShowTwoFactorAuthModal] = useState(false);
  const [image, setImage] = useState("images/default-profile.png");

  useEffect(() => {
    // Fetch the Medical Secretary's information
    axios.get(`${ip.address}/api/medicalsecretary/api/findone/${msid}`)
      .then(response => {
        const secData = response.data.theMedSec;
        setMedSecData(secData);
        setTwoFaEnabled(secData.twoFactorEnabled || false);
        setImage(secData.ms_image || "images/default-profile.png");
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Medical Secretary data:', err);
        setIsLoading(false);
      });
  }, [msid]);
  
  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = (updatedData) => {
    if (updatedData) {
      setMedSecData(prevState => ({
        ...prevState,
        ...updatedData, // Update with new information
      }));
    }
    setIsUpdateModalOpen(false);
  };

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const handleEnableDisableTwoFa = async () => {
    if (twoFaEnabled) {
      // Disable 2FA if already enabled
      try {
        const response = await axios.post(`${ip.address}/api/disable-2fa`, { 
          userId: medSecData._id, 
          role: medSecData.role 
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
      // If 2FA is disabled, show the TwoFactorAuth modal to enable it
      setShowTwoFactorAuthModal(true);
    }
  };

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

  if (isLoading) return (
    <div className="patInfoMain d-flex justify-content-center align-items-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <Container fluid className="patInfoMain overflow-auto">
      <Container fluid className="patInfoContainer py-4">
        <div className="patInfoHeader">
          <div className="patInfoTitleWrapper">
            <h3 className="patInfoTitle">Account Details</h3>
            <p className="patInfoSubtitle">Manage your medical secretary information</p>
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
                      alt={`${medSecData.ms_firstName}'s profile`}
                      className="patInfoAvatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${ip.address}/images/default-profile.png`;
                      }}
                    />
                  </div>
                </div>
                
                <div className="patInfoProfileDetails">
                  <h4 className="patInfoName">
                    {medSecData.ms_firstName} {medSecData.ms_lastName}
                  </h4>
                  <div className="patInfoBadge">Medical Secretary</div>

                  <div className="patInfoActionButtons">
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
                    <div className="patInfoValue">{medSecData.ms_firstName || 'Not provided'}</div>
                  </div>
                  
                  <div className="patInfoField">
                    <label className="patInfoLabel">Last Name</label>
                    <div className="patInfoValue">{medSecData.ms_lastName || 'Not provided'}</div>
                  </div>
                  
                  <div className="patInfoField">
                    <label className="patInfoLabel">Username</label>
                    <div className="patInfoValue">{medSecData.ms_username || 'Not provided'}</div>
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
                    <div className="patInfoValue">{maskEmail(medSecData.ms_email)}</div>
                  </div>
                </div>
                
                <div className="patInfoRow">
                  <div className="patInfoField">
                    <label className="patInfoLabel">Contact Number</label>
                    <div className="patInfoValue">{medSecData.ms_contactNumber || 'Not provided'}</div>
                  </div>
                  
                  <div className="patInfoField">
                    <label className="patInfoLabel">Role</label>
                    <div className="patInfoValue">{medSecData.role || 'Medical Secretary'}</div>
                  </div>
                </div>
                
                <div className="patInfoDivider"></div>
                
                <div className="patInfoActions">
                  <Button 
                    variant="primary" 
                    className="patInfoEditBtn"
                    onClick={openUpdateModal}
                  >
                    <Icon.PencilFill /> Edit Information
                  </Button>
                  <Button 
                    variant="light" 
                    className="patInfoPasswordBtn"
                    onClick={openChangePasswordModal}
                  >
                    <Icon.LockFill /> Change Password
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>

      {/* Modals */}
      {showTwoFactorAuthModal && (
        <TwoFactorAuth 
          show={showTwoFactorAuthModal} 
          handleClose={() => setShowTwoFactorAuthModal(false)} 
        />
      )}

      <UpdateInfoModal
        show={isUpdateModalOpen}
        handleClose={closeUpdateModal}
        currentData={medSecData}
      />

      <ChangePasswordModal
        show={isChangePasswordModalOpen}
        handleClose={closeChangePasswordModal}
        msid={msid}
        email={medSecData.ms_email}
        password={medSecData.ms_password}
      />
    </Container>
  );
};

export default MedicalSecretaryInfoForm;