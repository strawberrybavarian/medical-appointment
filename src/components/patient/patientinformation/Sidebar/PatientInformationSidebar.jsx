import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter } from 'cdbreact';
import './PatientInformationSidebar.css';
import PatientInformation from "../PatientInformation/PatientInformation";
import PatientPrescriptions from '../PatientPrescriptions/PatientPrescriptions';
import TwoFactorAuth from '../TwoFactorAuth/TwoFactorAuth';

function PatientInformationSidebar() {
    const navigate = useNavigate();
    const { pid } = useParams();
    const [activeTab, setActiveTab] = useState('profile');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className='pisb-sidebarcontainer'>
            <CDBSidebar textColor="#fff" backgroundColor="#333" minWidth="250px">
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

                        <Link onClick={() => handleTabClick('prescriptions')}>
                            <CDBSidebarMenuItem icon="prescription" className="pisb-name">
                                My Prescription
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
            
            <div className=" pis-container">
                {activeTab === 'profile' && <PatientInformation />}
                {activeTab === 'records' && <div>My Medical Record Component</div>}
                {activeTab === 'prescriptions' && <PatientPrescriptions />}
                {activeTab === 'twofactor' && <TwoFactorAuth />}
                
                <div>
                <div>
                <div>
                <div>
         
                </div>
                </div>
                </div>
                </div>


            </div>
        </div>
    );
}

export default PatientInformationSidebar;
