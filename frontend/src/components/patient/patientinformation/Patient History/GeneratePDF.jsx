import React from 'react';
import { Button } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import 'jspdf-autotable'; // Import the autotable plugin

const GeneratePDF = ({ record, doctorFullName}) => {
  console.log('Generate PDF', record);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    // Title
    doc.text(`Patient Medical Record`, 14, 20);
    doc.text(`Date: ${new Date(record.createdAt).toLocaleString()}`, 14, 30);

    // Doctor Details
    doc.text(`Doctor: ${doctorFullName}`, 14, 40);

    // Symptoms
    const symptoms = record.historyOfPresentIllness?.currentSymptoms?.join(", ") || "N/A";
    doc.text(`Symptoms: ${symptoms}`, 14, 50);

    // Assessment (Check if it's present)
    const interpretation = record.interpretation || "N/A";
    const assessment = record.assessment || "N/A";
    const recommendations = record.recommendations || "N/A";
    const remarks = record.remarks || "N/A";

    doc.text(`Interpretation: ${interpretation}`, 14, 60);
    doc.text(`Assessment: ${assessment}`, 14, 70);
    doc.text(`Recommendations: ${recommendations}`, 14, 80);
    doc.text(`Remarks: ${remarks}`, 14, 90);

    // Vitals (Check if vitals exist)
    doc.text(`Vitals:`, 14, 100);
    const bloodPressure = record.bloodPressure || {};
    const systole = bloodPressure.systole || "N/A";
    const diastole = bloodPressure.diastole || "N/A";

    doc.text(`Blood Pressure: ${systole} / ${diastole}`, 14, 110);
    doc.text(`Pulse Rate: ${record.pulseRate || "N/A"}`, 14, 120);
    doc.text(`Temperature: ${record.temperature || "N/A"}`, 14, 130);
    doc.text(`Respiratory Rate: ${record.respiratoryRate || "N/A"}`, 14, 140);
    doc.text(`Weight: ${record.weight || "N/A"}`, 14, 150);
    doc.text(`Height: ${record.height || "N/A"}`, 14, 160);

    // Allergies, Skin Conditions, and Family History (Check if arrays are empty)
    const allergies = record.allergy && record.allergy.length > 0 ? record.allergy.join(", ") : "No allergies";
    const skinCondition = record.skinCondition && record.skinCondition.length > 0 ? record.skinCondition.join(", ") : "No skin condition";
    const familyHistory = record.familyHistory && record.familyHistory.length > 0 
      ? record.familyHistory.map(item => `${item.relation}: ${item.condition}`).join(", ")
      : "No family history";

    doc.text(`Allergies: ${allergies}`, 14, 170);
    doc.text(`Skin Conditions: ${skinCondition}`, 14, 180);
    doc.text(`Family History: ${familyHistory}`, 14, 190);

    // Save PDF
    doc.save(`Patient_${record._id}_Medical_Record.pdf`);
  };

  return (
    <Button variant="outline-success" onClick={generatePDF}>
      Download PDF
    </Button>
  );
};

export default GeneratePDF;
