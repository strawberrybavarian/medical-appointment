import React from 'react';
import { Row, Col } from 'react-bootstrap';
const DoctorBiography = ({biography}) => {
    return (
        <div>
           <div className="biography-details">
          <Row>
            <Col xs={12} md={12}>
            <br />
              {/* Medical School */}
              <h5><strong>Medical School</strong></h5>
              <p>{biography.medicalSchool?.institution || 'N/A'}</p>
              <br />

              {/* Residency */}
              <h5><strong>Residency</strong></h5>
              <p>{biography.residency?.institution || 'N/A'}</p>
              <br />

              {/* Fellowship */}
              <h5><strong>Fellowship</strong></h5>
              <p>{biography.fellowship?.institution || 'N/A'}</p>
              <br />

              {/* Local Specialty Board */}
              <h5><strong>Local Specialty Board</strong></h5>
              <p>{biography.localSpecialtyBoard?.issuingOrganization || 'N/A'}</p>
              <br />

              {/* Local Sub Specialty Board */}
              <h5><strong>Local Sub Specialty Board</strong></h5>
              <p>{biography.localSubSpecialtyBoard?.issuingOrganization || 'N/A'}</p>
              <br />
            </Col>
          </Row>
        </div>
        </div>
    );
};

export default DoctorBiography;