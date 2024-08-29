
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import SidebarAdmin from '../../sidebar/SidebarAdmin';

import PieSpecialization from '../charts/PieSpecialization';
import DoctorStatsCards from '../cards/DoctorStatsCards';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';

function DoctorMain() {
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [registeredDoctors, setRegisteredDoctors] = useState(0);
    const [reviewedDoctors, setReviewedDoctors] = useState(0);
    const { aid } = useParams();


    useEffect(() => {
        axios.get(`${ip.address}/admin/api/doctors/count`)
            .then(response => {
                setTotalDoctors(response.data.totalDoctors);
            })
            .catch(error => {
                console.error('Error fetching total doctors:', error);
            });

        axios.get(`${ip.address}/admin/api/doctors/registered/count`)
            .then(response => {
                setRegisteredDoctors(response.data.registeredDoctors);
            })
            .catch(error => {
                console.error('Error fetching registered doctors:', error);
            });

        axios.get(`${ip.address}/admin/api/doctors/reviewed/count`)
            .then(response => {
                setReviewedDoctors(response.data.reviewedDoctors);
            })
            .catch(error => {
                console.error('Error fetching unregistered patients:', error);
            });
        


        

        
    }, []);
  return (
   <>
        <div className="d-flex justify-content-center">
                <SidebarAdmin aid={aid} />
                <div style={{ width: '100%' }}>
                    <AdminNavbar />
                    <Container className='ad-container' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
                        <DoctorStatsCards 
                            totalDoctors={totalDoctors} 
                            registeredDoctors={registeredDoctors} 
                            reviewedDoctors={reviewedDoctors}
                        />

                        {/* <DoctorStatsCards
                            totalDoctors={totalDoctors}
                        /> */}

                        <div className="d-flex justify-content-between" style={{ paddingTop: '1.5rem' }}> 
                            <PieSpecialization/>

                        </div>
                    </Container>
                </div>
        </div>
   
   </>
  )
}

export default DoctorMain