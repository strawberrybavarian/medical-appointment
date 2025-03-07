import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PersonFill, 
  FileEarmarkMedicalFill, 
  ClockHistory, 
  ChevronLeft,
  ChevronRight,
  GearFill
} from 'react-bootstrap-icons';
import axios from 'axios';
import './PatientInformationSidebar.css';
import PatientInformation from "../PatientInformation/PatientInformation";
import { Container, Button } from "react-bootstrap";
import PatientMedicalRecord from '../Medical Record/PatientMedicalRecord';
import AuditPatient from '../Audit/AuditPatient';
import { ip } from '../../../../ContentExport';

function PatientInformationSidebar({pid}) {
    const [activeTab, setActiveTab] = useState('profile');
    const [collapsed, setCollapsed] = useState(false);
    const [mobileView, setMobileView] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [patientImage, setPatientImage] = useState('');
    
    useEffect(() => {
        // Check if mobile view
        const handleResize = () => setMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        handleResize();
        
        // Fetch patient basic info for sidebar
        if (pid) {
            axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
                .then(res => {
                    const patient = res.data.thePatient;
                    setPatientName(`${patient.patient_firstName} ${patient.patient_lastName}`);
                    setPatientImage(patient.patient_image || "images/014ef2f860e8e56b27d4a3267e0a193a.jpg");
                })
                .catch(err => console.log('Error fetching patient:', err));
        }
        
        return () => window.removeEventListener('resize', handleResize);
    }, [pid]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        if (mobileView) {
            setCollapsed(true);
        }
    };
    
    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="patient-sidebar-layout">
            {/* Collapsible Sidebar */}
            <aside className={`patient-sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="patient-sidebar-toggle" onClick={toggleSidebar}>
                    {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </div>
                
                {/* Sidebar Header with Patient Info */}
                <div className="patient-sidebar-header">
                    {!collapsed && (
                        <>
                            <div className="patient-sidebar-avatar">
                                <img 
                                    src={`${ip.address}/${patientImage}`} 
                                    alt="Patient" 
                                />
                            </div>
                            <h5 className="patient-sidebar-name">{patientName}</h5>
                            <div className="patient-sidebar-badge">Patient Account Information</div>
                        </>
                    )}
                    {collapsed && (
                        <div className="patient-sidebar-avatar-small">
                            <img 
                                src={`${ip.address}/${patientImage}`} 
                                alt="Patient" 
                            />
                        </div>
                    )}
                </div>
                
                {/* Sidebar Navigation */}
                <nav className="patient-sidebar-nav">
                    <ul className="patient-sidebar-menu">
                        <li 
                            className={activeTab === 'profile' ? 'active' : ''}
                            onClick={() => handleTabClick('profile')}
                        >
                            <PersonFill className="patient-sidebar-icon" />
                            {!collapsed && <span>My Profile</span>}
                        </li>
                        
                        <li 
                            className={activeTab === 'records' ? 'active' : ''}
                            onClick={() => handleTabClick('records')}
                        >
                            <FileEarmarkMedicalFill className="patient-sidebar-icon" />
                            {!collapsed && <span>Medical Records</span>}
                        </li>
                        
                        <li 
                            className={activeTab === 'audit' ? 'active' : ''}
                            onClick={() => handleTabClick('audit')}
                        >
                            <ClockHistory className="patient-sidebar-icon" />
                            {!collapsed && <span>Activity Log</span>}
                        </li>
                        
                        {/* You can add more menu items as needed */}
                    </ul>
                </nav>
                
                {/* Sidebar Footer */}
                <div className="patient-sidebar-footer">
                    {!collapsed && (
                        <div className="patient-sidebar-footer-content">
                            <p>© 2024 Molino Care</p>
                            <small>Version 1.0.2</small>
                        </div>
                    )}
                </div>
            </aside>
            
            {/* Main Content - Fixed scrolling issue */}
            <Container fluid className={`patient-sidebar-content-wrapper ${collapsed ? 'expanded' : ''}`}>
                <Container fluid className="patient-sidebar-content">
                    <div className="patient-content-scrollable">
                        {activeTab === 'profile' && <PatientInformation pid={pid} />}
                        {activeTab === 'records' && <PatientMedicalRecord pid={pid} />}
                        {activeTab === 'audit' && <AuditPatient pid={pid} />}
                    </div>
                </Container>
            </Container>
            
            <style jsx>{`
                .patient-sidebar-layout {
                    display: flex;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                }
                

                .patient-sidebar-content-wrapper.expanded {
                    margin-left: 0;
                }
                
                .patient-sidebar-content {
                    height: 100%;
                    padding: 1px;
                    margin-left: 10px;    
                    padding-bottom: 70px;
                    background-color: #f8f9fa;
                    overflow: hidden;
                }
                
                .patient-content-scrollable {
                    height: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding-right: 10px; /* Prevent content shift when scrollbar appears */
                }
                
                /* Custom scrollbar for content area */
                .patient-content-scrollable::-webkit-scrollbar {
                    width: 8px;
                }
                
                .patient-content-scrollable::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .patient-content-scrollable::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                
                .patient-content-scrollable::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                
                @media (max-width: 767px) {
                    .patient-sidebar-content {
                        padding: 16px 12px;
                    }
                    
                    /* Ensure proper scrolling on mobile */
                    .patient-sidebar-content-wrapper {
                        height: 100vh;
                        width: 100vw;
                    }
                }
            `}</style>
        </div>
    );
}

export default PatientInformationSidebar;