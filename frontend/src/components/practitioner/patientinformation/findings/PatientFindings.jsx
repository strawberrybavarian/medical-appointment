import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form, Accordion, Badge, Spinner } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import "./PatientFindings.css";
import PatientHistory from "./PatientHistory";
import { ip } from "../../../../ContentExport";
import { 
  PlusCircle, 
  Trash, 
  CloudCheck, 
  XCircle, 
  PersonVcard, 
  ClipboardPulse, 
  Lungs, 
  Activity,
  HeartPulse,
  PeopleFill,
  PersonCheck,
  ListCheck
} from 'react-bootstrap-icons';
import { debounce } from 'lodash';

function PatientFindings({ patientId, appointmentId, doctorId }) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [followup, setFollowup] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
  const [findings, setFindings] = useState({
    bloodPressure: { systole: "", diastole: "" },
    respiratoryRate: "",
    pulseRate: "",
    temperature: "",
    weight: "",
    height: "",
    historyOfPresentIllness: { chiefComplaint: "", currentSymptoms: [""] },
    bloodSugar: { fasting: "", random: "" },
    cholesterol: { total: "", ldl: "", hdl: "", triglycerides: "" },
    oxygenSaturation: "",
    generalCondition: "Stable",
    lifestyle: {
      smoking: false,
      alcoholConsumption: false,
      physicalActivity: "",
      others: [],
    },
    familyHistory: [{ relation: "", condition: "" }],
    socialHistory: {
      employmentStatus: "",
      livingSituation: "",
      socialSupport: true,
    },
    mentalHealth: { mood: "", anxietyLevel: "", depressionLevel: "" },
    skinCondition: [],
    allergy: [],
    neurologicalFindings: "",
    gastrointestinalSymptoms: "",
    cardiovascularSymptoms: "",
    reproductiveHealth: "",
    remarks: "",
    interpretation: "",
    recommendations: "",
    assessment: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (findingsData) => {
      setSaveStatus("saving");
      
      try {
        let updatedSkinConditions = findingsData.skinCondition || [];
        if (updatedSkinConditions.includes("Other") && findingsData.otherSkinCondition) {
          updatedSkinConditions = updatedSkinConditions.map((condition) =>
            condition === "Other" ? findingsData.otherSkinCondition : condition
          );
        }
        
        let updatedAllergies = findingsData.allergy || [];
        if (updatedAllergies.includes("Other") && findingsData.otherAllergy) {
          updatedAllergies = updatedAllergies.map((allergy) =>
            allergy === "Other" ? findingsData.otherAllergy : allergy
          );
        }
        
        await axios.post(`${ip.address}/api/createfindings`, {
          ...findingsData,
          skinCondition: updatedSkinConditions,
          allergy: updatedAllergies,
          patient: patientId,
          appointment: appointmentId,
          doctor: doctorId,
        });
        
        setSaveStatus("saved");
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      } catch (err) {
        console.error("Error auto-saving findings:", err);
        setSaveStatus("error");
      }
    }, 800),
    [patientId, appointmentId, doctorId]
  );

  // Trigger auto-save when findings change
  useEffect(() => {
    if (findings.historyOfPresentIllness?.chiefComplaint) {
      debouncedSave(findings);
    }
  }, [findings, debouncedSave]);

  useEffect(() => {
    if (!patientId || !appointmentId) {
      setError("Missing patient or appointment ID.");
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientRes, appointmentRes] = await Promise.all([
          axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`),
          axios.get(`${ip.address}/api/appointments/${appointmentId}`),
        ]);
        
        const patientData = patientRes.data.thePatient;
        const appointmentData = appointmentRes.data;
        
        setFname(patientData.patient_firstName);
        setLname(patientData.patient_lastName);
        setAge(patientData.patient_age);
        setEmail(patientData.patient_email);
        setReason(appointmentData.reason);
        setFollowup(appointmentData.followUp);
        setAppointmentDate(appointmentData.date);
        
        const findingsRes = await axios.get(
          `${ip.address}/api/getfindings/${appointmentId}`
        );
        
        if (findingsRes.data && findingsRes.data.findings) {
          setFindings((prevState) => ({
            ...prevState,
            ...findingsRes.data.findings,
            lifestyle: {
              ...prevState.lifestyle,
              ...findingsRes.data.findings.lifestyle,
              others: findingsRes.data.findings.lifestyle?.others || [],
            },
          }));
        } else {
          setFindings({
            bloodPressure: { systole: "", diastole: "" },
            respiratoryRate: "",
            pulseRate: "",
            temperature: "",
            weight: "",
            height: "",
            historyOfPresentIllness: {
              chiefComplaint: "",
              currentSymptoms: [""],
            },
            bloodSugar: { fasting: "", random: "" },
            cholesterol: { total: "", ldl: "", hdl: "", triglycerides: "" },
            oxygenSaturation: "",
            generalCondition: "Stable",
            lifestyle: {
              smoking: false,
              alcoholConsumption: false,
              physicalActivity: "",
              others: [],
            },
            familyHistory: [{ relation: "", condition: "" }],
            socialHistory: {
              employmentStatus: "",
              livingSituation: "",
              socialSupport: true,
            },
            mentalHealth: { mood: "", anxietyLevel: "", depressionLevel: "" },
            skinCondition: [],
            allergy: [],
            neurologicalFindings: "",
            gastrointestinalSymptoms: "",
            cardiovascularSymptoms: "",
            reproductiveHealth: "",
            remarks: "",
            interpretation: "",
            recommendations: "",
            assessment: "",
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, appointmentId]);

  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    
    if (name.includes("systole") || name.includes("diastole")) {
      setFindings((prevState) => ({
        ...prevState,
        bloodPressure: {
          ...prevState.bloodPressure,
          [name]: value,
        },
      }));
    } else if (name.includes("fasting") || name.includes("random")) {
      setFindings((prevState) => ({
        ...prevState,
        bloodSugar: {
          ...prevState.bloodSugar,
          [name]: value,
        },
      }));
    } else if (
      name.includes("total") ||
      name.includes("ldl") ||
      name.includes("hdl") ||
      name.includes("triglycerides")
    ) {
      setFindings((prevState) => ({
        ...prevState,
        cholesterol: {
          ...prevState.cholesterol,
          [name]: value,
        },
      }));
    } else if (name === "smoking" || name === "alcoholConsumption") {
      setFindings((prevState) => ({
        ...prevState,
        lifestyle: {
          ...prevState.lifestyle,
          [name]: checked,
        },
      }));
    } else if (name === "socialSupport") {
      setFindings((prevState) => ({
        ...prevState,
        socialHistory: {
          ...prevState.socialHistory,
          [name]: checked,
        },
      }));
    } else if (name === "others") {
      const index = dataset.index;
      const updatedOthers = findings.lifestyle.others
        ? [...findings.lifestyle.others]
        : [];
      updatedOthers[index] = value;
      setFindings((prevState) => ({
        ...prevState,
        lifestyle: {
          ...prevState.lifestyle,
          others: updatedOthers,
        },
      }));
    } else {
      setFindings((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!findings.historyOfPresentIllness.chiefComplaint.trim()) {
      alert("Chief Complaint is required.");
      return;
    }
    
    const validSymptoms =
      findings.historyOfPresentIllness.currentSymptoms.filter(
        (symptom) => symptom.trim() !== ""
      );
      
    if (validSymptoms.length === 0) {
      alert("At least one valid symptom is required.");
      return;
    }
    
    let updatedSkinConditions = findings.skinCondition || [];
    if (updatedSkinConditions.includes("Other") && findings.otherSkinCondition) {
      updatedSkinConditions = updatedSkinConditions.map((condition) =>
        condition === "Other" ? findings.otherSkinCondition : condition
      );
    }
    
    let updatedAllergies = findings.allergy || [];
    if (updatedAllergies.includes("Other") && findings.otherAllergy) {
      updatedAllergies = updatedAllergies.map((allergy) =>
        allergy === "Other" ? findings.otherAllergy : allergy
      );
    }
    
    try {
      setSaveStatus("saving");
      
      await axios.post(`${ip.address}/api/createfindings`, {
        ...findings,
        skinCondition: updatedSkinConditions,
        allergy: updatedAllergies,
        patient: patientId,
        appointment: appointmentId,
        doctor: doctorId,
      });
      
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("Error saving findings:", err);
      setSaveStatus("error");
    }
  };

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="save-indicator saving">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Saving...</span>
          </div>
        );
      case "saved":
        return (
          <div className="save-indicator saved">
            <CloudCheck size={18} className="me-2" />
            <span>All changes saved</span>
          </div>
        );
      case "error":
        return (
          <div className="save-indicator error">
            <XCircle size={18} className="me-2" />
            <span>Error saving changes</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5 p-5">
        <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 lead">Loading patient data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger m-5 p-4">
        <h4>Error</h4>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <Container fluid className="findings-container">
      <Row className="mt-4 d-flex">
        <Col md={4}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex align-items-center">
              <PersonVcard className="text-primary me-2" size={24} />
              <h4 className="m-0 fw-bold text-gray">Patient Details</h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="mb-3">
                <Col xs={4} className="text-muted">Name:</Col>
                <Col xs={8} className="fw-medium">{fname} {lname}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="text-muted">Age:</Col>
                <Col xs={8}>{age} years</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="text-muted">Email:</Col>
                <Col xs={8}>{email}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="text-muted">Concern:</Col>
                <Col xs={8}>{reason}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="text-muted">Follow Up:</Col>
                <Col xs={8}>
                  <Badge bg={followup ? "success" : "secondary"} pill>
                    {followup ? "Yes" : "No"}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <PatientHistory pid={patientId} />
        </Col>
        
        <Col md={8}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3 border-bottom border-2">
              <div className="d-flex align-items-center">
                <ClipboardPulse size={24} className="text-primary me-2" />
                <h4 className="m-0 fw-bold">Patient Findings</h4>
              </div>
              {renderSaveStatus()}
            </Card.Header>
            
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Accordion defaultActiveKey="0" className="mb-4">
                  {/* History of Present Illness Section */}
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <div className="d-flex align-items-center">
                        <HeartPulse className="text-danger me-2" />
                        <span className="fw-bold">History of Present Illness</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="pt-4">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Chief Complaint:*</Form.Label>
                        <Form.Control
                          type="text"
                          name="chiefComplaint"
                          value={findings?.historyOfPresentIllness?.chiefComplaint || ""}
                          onChange={(e) => {
                            setFindings({
                              ...findings,
                              historyOfPresentIllness: {
                                ...findings.historyOfPresentIllness,
                                chiefComplaint: e.target.value,
                              },
                            });
                          }}
                          placeholder="Enter the primary complaint"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Current Symptoms:*</Form.Label>
                        {findings.historyOfPresentIllness?.currentSymptoms?.map(
                          (symptom, index) => (
                            <Row key={index} className="mb-2 align-items-center">
                              <Col>
                                <Form.Control
                                  type="text"
                                  value={symptom || ""}
                                  placeholder={`Symptom ${index + 1}`}
                                  onChange={(e) => {
                                    const updatedSymptoms = [
                                      ...findings.historyOfPresentIllness
                                        .currentSymptoms,
                                    ];
                                    updatedSymptoms[index] = e.target.value;
                                    setFindings({
                                      ...findings,
                                      historyOfPresentIllness: {
                                        ...findings.historyOfPresentIllness,
                                        currentSymptoms: updatedSymptoms,
                                      },
                                    });
                                  }}
                                />
                              </Col>
                              <Col xs="auto">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="rounded-circle p-1"
                                  onClick={() => {
                                    if (findings.historyOfPresentIllness.currentSymptoms.length > 1) {
                                      const updatedSymptoms =
                                        findings.historyOfPresentIllness.currentSymptoms.filter(
                                          (_, i) => i !== index
                                        );
                                      setFindings({
                                        ...findings,
                                        historyOfPresentIllness: {
                                          ...findings.historyOfPresentIllness,
                                          currentSymptoms: updatedSymptoms,
                                        },
                                      });
                                    }
                                  }}
                                >
                                  <Trash size={14} />
                                </Button>
                              </Col>
                            </Row>
                          )
                        )}
                        
                        <Button
                          className="mt-2"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setFindings((prevState) => ({
                              ...prevState,
                              historyOfPresentIllness: {
                                ...prevState.historyOfPresentIllness,
                                currentSymptoms: [
                                  ...prevState.historyOfPresentIllness
                                    .currentSymptoms,
                                  "",
                                ],
                              },
                            }));
                          }}
                        >
                          <PlusCircle size={16} className="me-1" /> Add Symptom
                        </Button>
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>
                  
                  {/* Vitals Section */}
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>
                      <div className="d-flex align-items-center">
                        <Activity className="text-success me-2" />
                        <span className="fw-bold">Vitals</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="pt-4">
                      <Row className="g-3">
                        <Col lg={6}>
                          <Card className="h-100 border-light">
                            <Card.Body>
                              <h6 className="mb-3 text-primary">Blood Pressure</h6>
                              <Row>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Systole:</Form.Label>
                                    <Form.Control
                                      type="number"
                                      name="systole"
                                      value={findings?.bloodPressure?.systole || ""}
                                      onChange={handleChange}
                                      placeholder="mmHg"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Diastole:</Form.Label>
                                    <Form.Control
                                      type="number"
                                      name="diastole"
                                      value={findings?.bloodPressure?.diastole || ""}
                                      onChange={handleChange}
                                      placeholder="mmHg"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col lg={6}>
                          <Card className="h-100 border-light">
                            <Card.Body>
                              <h6 className="mb-3 text-primary">Respiratory & Pulse</h6>
                              <Row>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Respiratory Rate:</Form.Label>
                                    <Form.Control
                                      type="number"
                                      name="respiratoryRate"
                                      value={findings?.respiratoryRate || ""}
                                      onChange={handleChange}
                                      placeholder="breaths/min"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Pulse Rate:</Form.Label>
                                    <Form.Control
                                      type="number"
                                      name="pulseRate"
                                      value={findings?.pulseRate || ""}
                                      onChange={handleChange}
                                      placeholder="bpm"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col lg={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Temperature (°C):</Form.Label>
                            <Form.Control
                              type="number"
                              name="temperature"
                              step="0.1"
                              value={findings?.temperature || ""}
                              onChange={handleChange}
                              placeholder="°C"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col lg={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Weight (kg):</Form.Label>
                            <Form.Control
                              type="number"
                              name="weight"
                              step="0.1"
                              value={findings?.weight || ""}
                              onChange={handleChange}
                              placeholder="kg"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col lg={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Height (cm):</Form.Label>
                            <Form.Control
                              type="number"
                              name="height"
                              value={findings?.height || ""}
                              onChange={handleChange}
                              placeholder="cm"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                  
                  {/* Lifestyle Section */}
                  <Accordion.Item eventKey="2">
                    <Accordion.Header>
                      <div className="d-flex align-items-center">
                        <PersonCheck className="text-info me-2" />
                        <span className="fw-bold">Lifestyle</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="pt-4">
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="mb-2">Habits:</h6>
                            <Form.Check
                              className="mb-2"
                              type="switch"
                              id="smoking-switch"
                              label="Smoking"
                              name="smoking"
                              checked={findings.lifestyle?.smoking || false}
                              onChange={handleChange}
                            />
                            
                            <Form.Check
                              className="mb-2"
                              type="switch"
                              id="alcohol-switch"
                              label="Alcohol Consumption"
                              name="alcoholConsumption"
                              checked={findings.lifestyle?.alcoholConsumption || false}
                              onChange={handleChange}
                            />
                          </div>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Other Lifestyle Activities:</Form.Label>
                            {findings.lifestyle?.others?.map((activity, index) => (
                              <Row key={index} className="mb-2">
                                <Col>
                                  <Form.Control
                                    type="text"
                                    name="others"
                                    data-index={index}
                                    value={activity || ""}
                                    onChange={handleChange}
                                    placeholder={`Activity ${index + 1}`}
                                  />
                                </Col>
                                <Col xs="auto">
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="rounded-circle p-1"
                                    onClick={() => {
                                      const updatedOthers =
                                        findings.lifestyle.others.filter(
                                          (_, i) => i !== index
                                        );
                                      setFindings((prevState) => ({
                                        ...prevState,
                                        lifestyle: {
                                          ...prevState.lifestyle,
                                          others: updatedOthers,
                                        },
                                      }));
                                    }}
                                  >
                                    <Trash size={14} />
                                  </Button>
                                </Col>
                              </Row>
                            ))}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setFindings((prevState) => ({
                                  ...prevState,
                                  lifestyle: {
                                    ...prevState.lifestyle,
                                    others: [...(prevState.lifestyle?.others || []), ""],
                                  },
                                }));
                              }}
                            >
                              <PlusCircle size={16} className="me-1" /> Add Activity
                            </Button>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                  
                  {/* Family History Section */}
                  <Accordion.Item eventKey="3">
                    <Accordion.Header>
                      <div className="d-flex align-items-center">
                        <PeopleFill className="text-warning me-2" />
                        <span className="fw-bold">Family History</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="pt-4">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Family Medical History:</Form.Label>
                        {findings.familyHistory?.map((history, index) => (
                          <Row key={index} className="mb-3 align-items-center">
                            <Col md={5}>
                              <Form.Select
                                value={history.relation || ""}
                                onChange={(e) => {
                                  const updatedFamilyHistory = [
                                    ...findings.familyHistory,
                                  ];
                                  updatedFamilyHistory[index].relation =
                                    e.target.value;
                                  setFindings({
                                    ...findings,
                                    familyHistory: updatedFamilyHistory,
                                  });
                                }}
                              >
                                <option value="">Select Relation</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Grandfather">Grandfather</option>
                                <option value="Grandmother">Grandmother</option>
                                <option value="Uncle">Uncle</option>
                                <option value="Aunt">Aunt</option>
                                <option value="Other">Other</option>
                              </Form.Select>
                            </Col>
                            
                            <Col md={5}>
                              <Form.Control
                                type="text"
                                value={history.condition || ""}
                                placeholder="Medical condition"
                                onChange={(e) => {
                                  const updatedFamilyHistory = [
                                    ...findings.familyHistory,
                                  ];
                                  updatedFamilyHistory[index].condition =
                                    e.target.value;
                                  setFindings({
                                    ...findings,
                                    familyHistory: updatedFamilyHistory,
                                  });
                                }}
                              />
                            </Col>
                            
                            <Col xs="auto">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="rounded-circle p-1"
                                onClick={() => {                                  if (findings.familyHistory.length > 1) {
                                  const updatedFamilyHistory = 
                                    findings.familyHistory.filter(
                                      (_, i) => i !== index
                                    );
                                  setFindings({
                                    ...findings,
                                    familyHistory: updatedFamilyHistory,
                                  });
                                }
                              }}
                            >
                              <Trash size={14} />
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setFindings({
                            ...findings,
                            familyHistory: [
                              ...findings.familyHistory,
                              { relation: "", condition: "" },
                            ],
                          });
                        }}
                      >
                        <PlusCircle size={16} className="me-1" /> Add Family History
                      </Button>
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
                
                {/* Assessment and Recommendations */}
                <Accordion.Item eventKey="4">
                  <Accordion.Header>
                    <div className="d-flex align-items-center">
                      <ListCheck className="text-purple me-2" />
                      <span className="fw-bold">Assessment & Plan</span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="pt-4">
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Assessment:</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="assessment"
                            value={findings.assessment || ""}
                            onChange={handleChange}
                            placeholder="Enter clinical assessment"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Interpretation:</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="interpretation"
                            value={findings.interpretation || ""}
                            onChange={handleChange}
                            placeholder="Enter interpretation of findings"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Recommendations:</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="recommendations"
                            value={findings.recommendations || ""}
                            onChange={handleChange}
                            placeholder="Enter treatment recommendations"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Additional Remarks:</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="remarks"
                            value={findings.remarks || ""}
                            onChange={handleChange}
                            placeholder="Any additional notes or remarks"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              
              <div className="d-flex justify-content-end mt-4">
                <Button 
                  type="submit" 
                  variant="primary"
                  size="lg"
                  disabled={saveStatus === "saving"}
                >
                  {saveStatus === "saving" ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Saving...
                    </>
                  ) : (
                    'Save Findings'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    
    <style jsx>{`
      .findings-container {
        max-width: 1400px;
        margin: 0 auto;
      }
      
      .save-indicator {
        display: flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        animation: fadeIn 0.3s ease;
        transition: opacity 0.5s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      }

      .save-indicator.saving {
        background-color: #e9ecef;
        color: #495057;
      }

      .save-indicator.saved {
        background-color: #d1e7dd;
        color: #0f5132;
        animation: fadeInOut 3s ease;
      }

      .save-indicator.error {
        background-color: #f8d7da;
        color: #721c24;
      }
      
      .text-purple {
        color: #6f42c1;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
      }
    `}</style>
  </Container>
);
}

export default PatientFindings;