import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { PencilFill } from "react-bootstrap-icons";
import axios from 'axios';
import { ip } from "../../../ContentExport";

const DoctorBiography = ({ did }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [biography, setBiography] = useState({
    medicalSchool: {
      institution: '',
      yearGraduated: ''
    },
    residency: {
      institution: '',
      yearCompleted: ''
    },
    fellowship: {
      institution: '',
      yearCompleted: ''
    },
    localSpecialtyBoard: {
      certification: '',
      issuingOrganization: '',
      year: ''
    },
    localSubSpecialtyBoard: {
      certification: '',
      issuingOrganization: '',
      year: ''
    }
  });

  // Fetch biography when the component mounts
  useEffect(() => {
    const fetchBiography = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/doctor/${did}/getbiography`);
        setBiography(response.data.biography || {});
      } catch (error) {
        console.error('Error fetching biography:', error);
      }
    };

    fetchBiography();
  }, [did]);

  // Handle input changes
  const handleChange = (event, section, field) => {
    const value = event.target.value;
    setBiography({
      ...biography,
      [section]: {
        ...biography[section],
        [field]: value
      }
    });
  };

  // Handle saving biography
  const handleSave = async () => {
    try {
      const response = await axios.put(`${ip.address}/api/doctor/${did}/updatebiography`, { biography });
      setBiography(response.data.biography); // Update with the new biography
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating biography:", error);
    }
  };

  // Handle deleting biography
  const handleDelete = async () => {
    try {
      await axios.delete(`${ip.address}/api/doctor/${did}/deletebiography`);
      setBiography({
        medicalSchool: {},
        residency: {},
        fellowship: {},
        localSpecialtyBoard: {},
        localSubSpecialtyBoard: {}
      });
    } catch (error) {
      console.error("Error deleting biography:", error);
    }
  };

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <h4></h4>
        <Button variant="primary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : (
            <>
              <PencilFill size={14} style={{ marginRight: "0.5rem" }} />
              Edit Biography
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <Form>
          {/* Medical School */}
          <h5><strong>Medical School</strong></h5>
          <Form.Group as={Row} controlId="medicalSchoolInstitution">
            <Form.Label column sm={2}>Institution</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={biography.medicalSchool?.institution || ''}
                onChange={(e) => handleChange(e, 'medicalSchool', 'institution')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="medicalSchoolYear">
            <Form.Label column sm={2}>Year Graduated</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="number"
                value={biography.medicalSchool?.yearGraduated || ''}
                onChange={(e) => handleChange(e, 'medicalSchool', 'yearGraduated')}
              />
            </Col>
          </Form.Group>

          {/* Residency */}
          <h5><strong>Residency</strong></h5>
          <Form.Group as={Row} controlId="residencyInstitution">
            <Form.Label column sm={2}>Institution</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={biography.residency?.institution || ''}
                onChange={(e) => handleChange(e, 'residency', 'institution')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="residencyYear">
            <Form.Label column sm={2}>Year Completed</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="number"
                value={biography.residency?.yearCompleted || ''}
                onChange={(e) => handleChange(e, 'residency', 'yearCompleted')}
              />
            </Col>
          </Form.Group>

          {/* Fellowship */}
          <h5><strong>Fellowship</strong></h5>
          <Form.Group as={Row} controlId="fellowshipInstitution">
            <Form.Label column sm={2}>Institution</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={biography.fellowship?.institution || ''}
                onChange={(e) => handleChange(e, 'fellowship', 'institution')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="fellowshipYear">
            <Form.Label column sm={2}>Year Completed</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="number"
                value={biography.fellowship?.yearCompleted || ''}
                onChange={(e) => handleChange(e, 'fellowship', 'yearCompleted')}
              />
            </Col>
          </Form.Group>

          {/* Local Specialty Board */}
          <h5><strong>Local Specialty Board</strong></h5>
          <Form.Group as={Row} controlId="localSpecialtyBoardCertification">
            <Form.Label column sm={2}>Certification</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={biography.localSpecialtyBoard?.certification || ''}
                onChange={(e) => handleChange(e, 'localSpecialtyBoard', 'certification')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="localSpecialtyBoardOrganization">
            <Form.Label column sm={2}>Issuing Organization</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={biography.localSpecialtyBoard?.issuingOrganization || ''}
                onChange={(e) => handleChange(e, 'localSpecialtyBoard', 'issuingOrganization')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="localSpecialtyBoardYear">
            <Form.Label column sm={2}>Year</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="number"
                value={biography.localSpecialtyBoard?.year || ''}
                onChange={(e) => handleChange(e, 'localSpecialtyBoard', 'year')}
              />
            </Col>
          </Form.Group>

          {/* Local Sub Specialty Board */}
          <h5><strong>Local Sub Specialty Board</strong></h5>
          <Form.Group as={Row} controlId="localSubSpecialtyBoardCertification">
            <Form.Label column sm={2}>Certification</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={biography.localSubSpecialtyBoard?.certification || ''}
                onChange={(e) => handleChange(e, 'localSubSpecialtyBoard', 'certification')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="localSubSpecialtyBoardOrganization">
            <Form.Label column sm={2}>Issuing Organization</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={biography.localSubSpecialtyBoard?.issuingOrganization || ''}
                onChange={(e) => handleChange(e, 'localSubSpecialtyBoard', 'issuingOrganization')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="localSubSpecialtyBoardYear">
            <Form.Label column sm={2}>Year</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="number"
                value={biography.localSubSpecialtyBoard?.year || ''}
                onChange={(e) => handleChange(e, 'localSubSpecialtyBoard', 'year')}
              />
            </Col>
          </Form.Group>

          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
          <Button variant="danger" onClick={handleDelete} className="ml-3">
            Delete Biography
          </Button>
        </Form>
      ) : (
        <div className="biography-details">
          <Row>
            <Col xs={12} md={12}>
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
      )}
    </div>
  );
};

export default DoctorBiography;
