import { useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter } from 'cdbreact';
import './PatientInformationSidebar.css';
import PatientInformation from "../PatientInformation/PatientInformation";
import PatientPrescriptions from '../PatientPrescriptions/PatientPrescriptions';
import TwoFactorAuth from '../TwoFactorAuth/TwoFactorAuth';
import { Container } from "react-bootstrap";
import PatientMedicalRecord from '../Medical Record/PatientMedicalRecord';
import Footer from '../../../Footer';

function PatientInformationSidebar({pid}) {
    const navigate = useNavigate();
       




    
    const [activeTab, setActiveTab] = useState('profile');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className='pisb-sidebarcontainer'>
            <CDBSidebar className='pisb-sidebar' textColor="#fff" backgroundColor="#333" minWidth="250px">
                <CDBSidebarHeader className="pisb-newheader head-div">
                </CDBSidebarHeader>

                <CDBSidebarContent>
                    <CDBSidebarMenu>
                        <Link  onClick={() => handleTabClick('profile')}>
                            <CDBSidebarMenuItem icon="user" className="pisb-name">
                                Profile
                            </CDBSidebarMenuItem>
                        </Link>

                        <Link  onClick={() => handleTabClick('records')}>
                            <CDBSidebarMenuItem icon="file-alt" className="pisb-name">
                                My Medical Record
                            </CDBSidebarMenuItem>
                        </Link>

                        <Link onClick={() => handleTabClick('twofactor')}>
                            <CDBSidebarMenuItem icon="lock" className="pisb-name">
                                Two Factor
                            </CDBSidebarMenuItem>
                        </Link>
                    </CDBSidebarMenu>
                </CDBSidebarContent>

                <CDBSidebarFooter style={{ textAlign: 'center' }}>
                    <div className="sidebar-btn-wrapper" style={{ padding: '20px 5px' }}>
                        © 2024 Your Company
                    </div>
                </CDBSidebarFooter>
            </CDBSidebar>

            
            <Container fluid className='cont-fluid-no-gutter' style={{overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem'}}>
                <div>
                    <div className="content-area mb-5">
                        {activeTab === 'profile' && <PatientInformation pid={pid} />}
                        {activeTab === 'records' && <PatientMedicalRecord pid={pid} />}
                        {activeTab === 'twofactor' && <TwoFactorAuth pid={pid} />}
                    </div>

                    <Container fluid className="footer-container cont-fluid-no-gutter w-100">
                        <Footer />
                </Container>
                </div>
            </Container>

        </div>
    );
}

export default PatientInformationSidebar;
