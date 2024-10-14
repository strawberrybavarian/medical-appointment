import React from 'react';
import { Container } from 'react-bootstrap';
const DoctorHMO = ({ theHmo }) => {
    return (
        <Container className='px-4 mt-3'>

       
        <div>
    
            <ul>
                {theHmo && theHmo.length > 0 ? (
                    theHmo.map((hmo, index) => (
                        <li key={index}>{hmo.name}</li>
                    ))
                ) : (
                    <p>No HMO accreditation available.</p>
                )}
            </ul>
        </div>
        </Container>
    );
};

export default DoctorHMO;
