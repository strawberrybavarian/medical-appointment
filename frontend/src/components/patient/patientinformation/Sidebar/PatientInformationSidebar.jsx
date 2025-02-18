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
import AuditPatient from '../Audit/AuditPatient';

function PatientInformationSidebar({pid}) {
    const navigate = useNavigate();
       




    
    const [activeTab, setActiveTab] = useState('profile');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className='pisb-sidebarcontainer' style={{position:'sticky'}}>
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
                            <CDBSidebarMenuItem icon="file" className="pisb-name">
                                My Medical Record
                            </CDBSidebarMenuItem>
                        </Link>


                        <Link onClick={() => handleTabClick('audit')}>
                            <CDBSidebarMenuItem icon="file-alt" className="pisb-name">
                                Activity Log 
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

            
            <Container fluid className='cont-fluid-no-gutter' style={{ overflowY: 'auto', height: 'calc(100vh)', width: '100%', paddingBottom: '1.5rem', overflowX: 'hidden' }} >
                <div>
                    <div className="content-area mb-5">
                        {activeTab === 'profile' && <PatientInformation pid={pid} />}
                        {activeTab === 'records' && <PatientMedicalRecord pid={pid} />}
                        {activeTab === 'audit' && <AuditPatient pid={pid} />}

                    </div>

            
                </div>
            </Container>

        </div>
    );
}

export default PatientInformationSidebar;
