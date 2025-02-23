import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import "./PatientFindings.css";
import PatientHistory from "./PatientHistory";
import { ip } from "../../../../ContentExport";
function PatientFindings({ patientId, appointmentId, doctorId }) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [followup, setFollowup] = useState("");
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
    if (
      updatedSkinConditions.includes("Other") &&
      findings.otherSkinCondition
    ) {
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
      await axios.post(`${ip.address}/api/createfindings`, {
        ...findings,
        skinCondition: updatedSkinConditions,
        allergy: updatedAllergies,
        patient: patientId,
        appointment: appointmentId,
        doctor: doctorId,
      });
      alert("Findings saved successfully");
    } catch (err) {
      console.error("Error saving findings:", err);
      alert("Error saving findings");
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <Container fluid>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="m-0 font-weight-bold text-gray">
                Patient Details
              </h4>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <strong>Patient Name:</strong> {fname} {lname}
              </Card.Text>
              <Card.Text>
                <strong>Patient Age:</strong> {age}
              </Card.Text>
              <Card.Text>
                <strong>Patient Email:</strong> {email}
              </Card.Text>
              <Card.Text>
                <strong>Primary Concern:</strong> {reason}
              </Card.Text>
              <Card.Text>
                <strong>Follow Up?:</strong> {followup ? "Yes" : "No"}
              </Card.Text>
            </Card.Body>
          </Card>
          <PatientHistory pid={patientId} />
        </Col>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex align-items-center">
              <h4 className="m-0 font-weight-bold text-gray">
                Patient Findings
              </h4>
            </Card.Header>
            <Card.Body>
              {/* {!canEdit && (
                <div className="alert alert-warning">
                  You cannot edit findings for appointments on a different date.
                </div>
              )} */}
              <Form onSubmit={handleSubmit}>
                <h4>History of Present Illness</h4>
                <hr />
                {}
                <Form.Group className="mb-3">
                  <Form.Label>Chief Complaint:</Form.Label>
                  <Form.Control
                    type="text"
                    name="chiefComplaint"
                    value={
                      findings?.historyOfPresentIllness?.chiefComplaint || ""
                    }
                    onChange={(e) => {
                      setFindings({
                        ...findings,
                        historyOfPresentIllness: {
                          ...findings.historyOfPresentIllness,
                          chiefComplaint: e.target.value,
                        },
                      });
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Current Symptoms: </Form.Label>
                  {findings.historyOfPresentIllness?.currentSymptoms?.map(
                    (symptom, index) => (
                      <Row key={index} className="mb-2 align-items-center">
                        <Col>
                          <Form.Control
                            type="text"
                            value={symptom || ""}
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
                            variant="danger"
                            onClick={() => {
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
                            }}
                          >
                            X
                          </Button>
                        </Col>
                      </Row>
                    )
                  )}
                  {}
                  <Button
                    className="mt-2"
                    variant="secondary"
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
                    Add Symptom
                  </Button>
                </Form.Group>
                <hr />
                <h4>Vitals</h4>
                <hr />
                <Form onSubmit={handleSubmit}>
                  {}
                  <Row className="mb-2">
                    <Form.Group as={Col} className="mb-3">
                      <Form.Label>Blood Pressure (Systole):</Form.Label>
                      <Form.Control
                        type="number"
                        name="systole"
                        value={findings?.bloodPressure?.systole || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                      <Form.Label>Blood Pressure (Diastole):</Form.Label>
                      <Form.Control
                        type="number"
                        name="diastole"
                        value={findings?.bloodPressure?.diastole || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Row>
                </Form>
                {}
                <Row className="mb-2">
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Respiratory Rate:</Form.Label>
                    <Form.Control
                      type="number"
                      name="respiratoryRate"
                      value={findings?.respiratoryRate || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Pulse Rate:</Form.Label>
                    <Form.Control
                      type="number"
                      name="pulseRate"
                      value={findings?.pulseRate || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Temperature (°C):</Form.Label>
                    <Form.Control
                      type="number"
                      name="temperature"
                      value={findings?.temperature || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-2">
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Weight (kg):</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={findings?.weight || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Height (cm):</Form.Label>
                    <Form.Control
                      type="number"
                      name="height"
                      value={findings?.height || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Row>
                <hr />
                <h4>Lifestyle</h4>
                <hr />
                {}
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Smoking"
                      name="smoking"
                      checked={findings.lifestyle.smoking}
                      onChange={handleChange}
                    />
                    <Form.Check
                      type="checkbox"
                      label="Alcohol Consumption"
                      name="alcoholConsumption"
                      checked={findings.lifestyle.alcoholConsumption}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  {}
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
                          />
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="danger"
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
                            X
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setFindings((prevState) => ({
                          ...prevState,
                          lifestyle: {
                            ...prevState.lifestyle,
                            others: [...prevState.lifestyle.others, ""],
                          },
                        }));
                      }}
                    >
                      Add Other Lifestyle Activity
                    </Button>
                  </Form.Group>
                </Row>
                {}
                <hr />
                <h4>Family History</h4>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Label>Family History (Relation/Condition):</Form.Label>
                  {findings.familyHistory?.map((history, index) => (
                    <Row key={index} className="mb-2">
                      <Col>
                        <Form.Control
                          as="select"
                          value={history.relation || ""}
                          style={{ fontSize: "14px", padding: "1px 10px" }}
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
                        </Form.Control>
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          value={history.condition || ""}
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
                    </Row>
                  )) || []}
                  <Button
                    variant="secondary"
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
                    Add Family History
                  </Button>
                </Form.Group>
                {}
                <hr />
                <h4>Skin Condition</h4>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Rash"
                    name="skinCondition"
                    value="Rash"
                    checked={(findings?.skinCondition || []).includes("Rash")}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedConditions = findings.skinCondition || [];
                      if (checked) {
                        updatedConditions.push(value);
                      } else {
                        updatedConditions = updatedConditions.filter(
                          (condition) => condition !== value
                        );
                      }
                      setFindings({
                        ...findings,
                        skinCondition: updatedConditions,
                      });
                    }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Jaundice"
                    name="skinCondition"
                    value="Jaundice"
                    checked={(findings?.skinCondition || []).includes(
                      "Jaundice"
                    )}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedConditions = findings.skinCondition || [];
                      if (checked) {
                        updatedConditions.push(value);
                      } else {
                        updatedConditions = updatedConditions.filter(
                          (condition) => condition !== value
                        );
                      }
                      setFindings({
                        ...findings,
                        skinCondition: updatedConditions,
                      });
                    }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Dry Skin"
                    name="skinCondition"
                    value="Dry Skin"
                    checked={(findings?.skinCondition || []).includes(
                      "Dry Skin"
                    )}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedConditions = findings.skinCondition || [];
                      if (checked) {
                        updatedConditions.push(value);
                      } else {
                        updatedConditions = updatedConditions.filter(
                          (condition) => condition !== value
                        );
                      }
                      setFindings({
                        ...findings,
                        skinCondition: updatedConditions,
                      });
                    }}
                  />
                  {}
                  <Form.Check
                    type="checkbox"
                    label="Other"
                    name="skinCondition"
                    value="Other"
                    checked={(findings?.skinCondition || []).includes("Other")}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedConditions = findings.skinCondition || [];
                      if (checked) {
                        updatedConditions.push(value);
                      } else {
                        updatedConditions = updatedConditions.filter(
                          (condition) => condition !== value
                        );
                      }
                      setFindings({
                        ...findings,
                        skinCondition: updatedConditions,
                      });
                    }}
                  />
                  {}
                  {findings?.skinCondition?.includes("Other") && (
                    <Form.Group className="mt-2">
                      <Form.Label>Specify Other Skin Condition:</Form.Label>
                      <Form.Control
                        type="text"
                        name="otherSkinCondition"
                        value={findings?.otherSkinCondition || ""}
                        onChange={(e) =>
                          setFindings({
                            ...findings,
                            otherSkinCondition: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  )}
                </Form.Group>
                <hr />
                <h4>Allergies</h4>
                <hr />
                <Form.Group className="mb-3">
                  {}
                  <Form.Check
                    type="checkbox"
                    label="Peanuts"
                    name="allergy"
                    value="Peanuts"
                    checked={(findings?.allergy || []).includes("Peanuts")}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedAllergies = findings.allergy || [];
                      if (checked) {
                        updatedAllergies.push(value);
                      } else {
                        updatedAllergies = updatedAllergies.filter(
                          (allergy) => allergy !== value
                        );
                      }
                      setFindings({ ...findings, allergy: updatedAllergies });
                    }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Shellfish"
                    name="allergy"
                    value="Shellfish"
                    checked={(findings?.allergy || []).includes("Shellfish")}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedAllergies = findings.allergy || [];
                      if (checked) {
                        updatedAllergies.push(value);
                      } else {
                        updatedAllergies = updatedAllergies.filter(
                          (allergy) => allergy !== value
                        );
                      }
                      setFindings({ ...findings, allergy: updatedAllergies });
                    }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Pollen"
                    name="allergy"
                    value="Pollen"
                    checked={(findings?.allergy || []).includes("Pollen")}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedAllergies = findings.allergy || [];
                      if (checked) {
                        updatedAllergies.push(value);
                      } else {
                        updatedAllergies = updatedAllergies.filter(
                          (allergy) => allergy !== value
                        );
                      }
                      setFindings({ ...findings, allergy: updatedAllergies });
                    }}
                  />
                  {}
                  <Form.Check
                    type="checkbox"
                    label="Other"
                    name="allergy"
                    value="Other"
                    checked={(findings?.allergy || []).includes("Other")}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let updatedAllergies = findings.allergy || [];
                      if (checked) {
                        updatedAllergies.push(value);
                      } else {
                        updatedAllergies = updatedAllergies.filter(
                          (allergy) => allergy !== value
                        );
                      }
                      setFindings({ ...findings, allergy: updatedAllergies });
                    }}
                  />
                  {}
                  {findings?.allergy?.includes("Other") && (
                    <Form.Group className="mt-2">
                      <Form.Label>Specify Other Allergy:</Form.Label>
                      <Form.Control
                        type="text"
                        name="otherAllergy"
                        value={findings?.otherAllergy || ""}
                        onChange={(e) =>
                          setFindings({
                            ...findings,
                            otherAllergy: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  )}
                </Form.Group>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Label>Assessment:</Form.Label>
                  <Form.Control
                    type="text"
                    name="assessment"
                    value={findings.assessment || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Interpretation:</Form.Label>
                  <Form.Control
                    type="text"
                    name="interpretation"
                    value={findings?.interpretation || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Recommendations:</Form.Label>
                  <Form.Control
                    type="text"
                    name="recommendations"
                    value={findings?.recommendations || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Remarks:</Form.Label>
                  <Form.Control
                    type="text"
                    name="remarks"
                    value={findings.remarks || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button type="submit" variant="primary">
                  Save Findings
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default PatientFindings;
