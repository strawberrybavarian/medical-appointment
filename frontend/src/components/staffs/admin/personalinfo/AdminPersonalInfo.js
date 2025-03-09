import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { ip } from '../../../../ContentExport';
import axios from 'axios';

//Components
import SidebarAdmin from '../sidebar/SidebarAdmin';
import AdminNavbar from '../navbar/AdminNavbar';
import * as Icon from "react-bootstrap-icons";

import AdminEditInfoModal from './AdminEditInfoModal';
import AdminChangePasswordModal from './AdminChangePasswordModal';
import AuditAdmin from './AuditAdmin';
import TwoFactorAuth from '../../../patient/patientinformation/TwoFactorAuth/TwoFactorAuth';
import './AdminPersonalInfo.css';

const AdminPersonalInfo = () => {
    const location = useLocation();
    const {userId, userName, role} = useLocation().state;

    const [admin, setAdmin] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthdate: '',
        contactNumber: ''
    });

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [twoFaEnabled, setTwoFaEnabled] = useState(false);
    const [showTwoFactorAuthModal, setShowTwoFactorAuthModal] = useState(false);
    const [profileImage, setProfileImage] = useState("images/014ef2f860e8e56b27d4a3267e0a193a.jpg");
    
    useEffect(() => {  
        axios.get(`${ip.address}/api/admin/${userId}`)
            .then(response => {
                setAdmin(response.data.theAdmin);
                setTwoFaEnabled(response.data.theAdmin.twoFactorEnabled || false);
                setProfileImage(response.data.theAdmin.profileImage || "images/014ef2f860e8e56b27d4a3267e0a193a.jpg");
            })
            .catch(error => {
                console.error('Error fetching admin:', error);
            });
    }, [userId]);
    
    const maskEmail = (email) => {
        if (!email || !email.includes("@")) {
          return email;
        }
    
        const [namePart, domainPart] = email.split("@");
        const maskedName = namePart[0] + "****" + namePart[namePart.length - 1];
        const domainParts = domainPart.split(".");
        const maskedDomain =
          domainParts[0][0] + "***" + domainParts[0][domainParts[0].length - 1];
        const topLevelDomain = domainParts[1];
    
        return `${maskedName}@${maskedDomain}.${topLevelDomain}`;
    };
    
    const handleCloseModal = () => {
        setShowInfoModal(false);
        setShowPasswordModal(false);
    }
  
    const handleEnableDisableTwoFa = async () => {
        if (twoFaEnabled) {
            try {
                const response = await axios.post(`${ip.address}/api/disable-2fa`, { 
                    userId: userId, 
                    role: role 
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

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <div className="d-flex justify-content-center">
                <div className="content-area p-0 m-0">
                    <div className="adminInfoMain overflow-auto">
                        <Container className="adminInfoContainer py-4">
                            <div className="adminInfoHeader">
                                <div className="adminInfoTitleWrapper">
                                    <h3 className="adminInfoTitle">Account Details</h3>
                                    <p className="adminInfoSubtitle">Manage your personal information</p>
                                </div>
                            </div>

                            <div className="adminInfoContent">
                                {/* Profile Card */}
                                <Card className="adminInfoProfileCard">
                                    <Card.Body>
                                        <div className="adminInfoProfileWrapper">
                                            <div className="adminInfoAvatarContainer">
                                                <div className="adminInfoAvatarWrapper">
                                                    <img 
                                                        src={`${ip.address}/${profileImage}`}
                                                        alt={`${admin.firstName}'s profile`}
                                                        className="adminInfoAvatar"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="adminInfoProfileDetails">
                                                <h4 className="adminInfoName">{admin.firstName} {admin.lastName}</h4>
                                                <div className="adminInfoBadge">Administrator</div>

                                                <div className="adminInfoActionButtons">
                                                    <Button 
                                                        variant={twoFaEnabled ? "outline-danger" : "outline-success"}
                                                        className="adminInfoSecurityBtn"
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
                                <Card className="adminInfoDetailsCard">
                                    <Card.Body>
                                        <h5 className="adminInfoSectionTitle">
                                            <Icon.Person className="adminInfoSectionIcon" />
                                            Personal Information
                                        </h5>
                                        
                                        <div className="adminInfoFormContainer">
                                            <div className="adminInfoRow">
                                                <div className="adminInfoField">
                                                    <label className="adminInfoLabel">First Name</label>
                                                    <div className="adminInfoValue">{admin.firstName}</div>
                                                </div>
                                                
                                                <div className="adminInfoField">
                                                    <label className="adminInfoLabel">Last Name</label>
                                                    <div className="adminInfoValue">{admin.lastName}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="adminInfoDivider"></div>
                                            
                                            <h5 className="adminInfoSectionTitle">
                                                <Icon.Envelope className="adminInfoSectionIcon" />
                                                Contact Information
                                            </h5>
                                            
                                            <div className="adminInfoRow">
                                                <div className="adminInfoField adminInfoFieldWide">
                                                    <label className="adminInfoLabel">Email Address</label>
                                                    <div className="adminInfoValue">{maskEmail(admin.email)}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="adminInfoRow">
                                                <div className="adminInfoField">
                                                    <label className="adminInfoLabel">Date of Birth</label>
                                                    <div className="adminInfoValue">
                                                        {formatDate(admin.birthdate)}
                                                    </div>
                                                </div>
                                                
                                                <div className="adminInfoField">
                                                    <label className="adminInfoLabel">Contact Number</label>
                                                    <div className="adminInfoValue">{admin.contactNumber || 'Not provided'}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="adminInfoDivider"></div>
                                            
                                            <div className="adminInfoActions">
                                                <Button 
                                                    variant="primary" 
                                                    className="adminInfoEditBtn"
                                                    onClick={() => setShowInfoModal(true)}
                                                >
                                                    <Icon.PencilFill /> Edit Information
                                                </Button>
                                                <Button 
                                                    variant="light" 
                                                    className="adminInfoPasswordBtn"
                                                    onClick={() => setShowPasswordModal(true)}
                                                >
                                                    <Icon.LockFill /> Change Password
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Activity Log Card */}
                                <Card className="adminInfoActivityCard">
                                    <Card.Body>
                                        <h5 className="adminInfoSectionTitle">
                                            <Icon.ClockHistory className="adminInfoSectionIcon" />
                                            Activity Log
                                        </h5>
                                        <div className="adminInfoDivider"></div>
                                        <AuditAdmin adminId={userId} />
                                    </Card.Body>
                                </Card>
                            </div>
                        </Container>
                    </div>
                </div>

                <AdminChangePasswordModal 
                    show={showPasswordModal} 
                    handleClose={handleCloseModal} 
                    admin={admin}
                />

                <AdminEditInfoModal
                    show={showInfoModal}
                    handleClose={handleCloseModal} 
                    adminId={admin._id}
                />

                {showTwoFactorAuthModal && (
                    <TwoFactorAuth 
                        show={showTwoFactorAuthModal} 
                        handleClose={() => setShowTwoFactorAuthModal(false)} 
                    />
                )}
            </div>
        </>
    )
}

export default AdminPersonalInfo;