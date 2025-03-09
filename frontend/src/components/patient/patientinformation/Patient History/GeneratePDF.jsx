import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';
import { ip } from '../../../../ContentExport';

const GeneratePDF = ({ record, doctorFullName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const logoPath = `${ip.address}/images/Molino-Polyclinic-Logo1.png`;
  
  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Create new document
      const doc = new jsPDF();
      
      // Load fonts
      doc.setFont("helvetica");
      
      // Define colors
      const primaryColor = [78, 115, 223]; // #4e73df - blue
      const secondaryColor = [28, 200, 138]; // #1cc88a - green
      const accentColor = [54, 185, 204]; // #36b9cc - cyan
      const textColor = [44, 62, 80]; // #2c3e50 - dark blue
      
      // Add logo - using dynamic path
      try {
        const logoImg = new Image();
        
        // Create a promise to wait for the image to load
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = logoPath;
        });
        
        doc.addImage(logoImg, 'PNG', 14, 10, 30, 30);
      } catch (error) {
        console.log('Could not load logo, using text instead');
        // Use text as logo fallback
        doc.setFontSize(24);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('Polyclinic', 14, 25);
      }
      
      // Add header
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('MEDICAL RECORD', 105, 25, { align: 'center' });
      
      // Add horizontal rule
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);
      
      // Patient details section
      doc.setFontSize(12);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('Date: ' + new Date(record.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }), 14, 45);
      
      doc.text('Patient ID: ' + (record.patient?.patient_ID || 'N/A'), 14, 52);
      doc.text('Name: ' + (record.patient?.patient_firstName + ' ' + record.patient?.patient_lastName || 'N/A'), 14, 59);
  
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(14, 66, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('DOCTOR INFORMATION', 105, 71.5, { align: 'center' });
      
      // Doctor information
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(11);
      doc.text('Attending Physician:', 14, 81);
      doc.setFontSize(12);
      doc.text(doctorFullName, 50, 81);
      doc.setFontSize(11);
      doc.text('Specialty:', 14, 88);
      doc.setFontSize(12);
      doc.text(record.doctor?.dr_specialty || 'N/A', 50, 88);
      
      // Medical Assessment Section
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(14, 95, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('MEDICAL ASSESSMENT', 105, 100.5, { align: 'center' });
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      
      // Create tables for better organization
      // Symptoms table
      const symptoms = record.historyOfPresentIllness?.currentSymptoms || [];
      doc.setFontSize(11);
      doc.text('Presenting Symptoms:', 14, 110);
      
      if (symptoms.length > 0) {
        doc.autoTable({
          startY: 113,
          head: [['Symptoms']],
          body: symptoms.map(symptom => [symptom]),
          theme: 'grid',
          headStyles: {
            fillColor: [220, 230, 242],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          margin: { left: 14, right: 14 },
          tableWidth: 182
        });
      } else {
        doc.text('No symptoms recorded', 14, 118);
      }
      
      // Current Y position after symptoms table
      let yPos = symptoms.length > 0 ? 
        doc.autoTable.previous.finalY + 10 : 125;
      
      // Interpretation & Assessment
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(14, yPos, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('DIAGNOSIS & RECOMMENDATIONS', 105, yPos + 5.5, { align: 'center' });
      
      yPos += 15;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      // Create assessment table
      doc.autoTable({
        startY: yPos,
        head: [['Category', 'Details']],
        body: [
          ['Interpretation', record.interpretation || 'N/A'],
          ['Assessment', record.assessment || 'N/A'],
          ['Recommendations', record.recommendations || 'N/A'],
          ['Remarks', record.remarks || 'N/A']
        ],
        theme: 'striped',
        headStyles: {
          fillColor: [220, 230, 242],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 14, right: 14 },
        tableWidth: 182
      });
      
      // Update Y position
      yPos = doc.autoTable.previous.finalY + 10;
      
      // Check if we need a new page for vitals
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Vitals Section
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(14, yPos, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('VITAL SIGNS', 105, yPos + 5.5, { align: 'center' });
      
      yPos += 15;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      // Create vitals table
      const bloodPressure = record.bloodPressure || {};
      const bp = `${bloodPressure.systole || 'N/A'}/${bloodPressure.diastole || 'N/A'} mmHg`;
      
      doc.autoTable({
        startY: yPos,
        head: [['Vital Sign', 'Value']],
        body: [
          ['Blood Pressure', bp],
          ['Pulse Rate', `${record.pulseRate || 'N/A'} bpm`],
          ['Temperature', `${record.temperature || 'N/A'} °C`],
          ['Respiratory Rate', `${record.respiratoryRate || 'N/A'} bpm`],
          ['Weight', `${record.weight || 'N/A'} kg`],
          ['Height', `${record.height || 'N/A'} cm`]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [220, 230, 242],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 },
        tableWidth: 182
      });
      
      // Update Y position
      yPos = doc.autoTable.previous.finalY + 10;
      
      // Check if we need a new page for allergies and conditions
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      
      // Allergies & Conditions Section
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(14, yPos, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('ALLERGIES & CONDITIONS', 105, yPos + 5.5, { align: 'center' });
      
      yPos += 15;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      // Allergies and skin conditions tables
      const allergies = record.allergy || [];
      const skinConditions = record.skinCondition || [];
      
      // Create two-column layout for allergies and skin conditions
      const allergyData = allergies.length > 0 ? 
        allergies.map(allergy => [allergy]) :
        [['No allergies recorded']];
        
      const skinData = skinConditions.length > 0 ? 
        skinConditions.map(condition => [condition]) :
        [['No skin conditions recorded']];
      
      // Left column: Allergies
      doc.autoTable({
        startY: yPos,
        head: [['Allergies']],
        body: allergyData,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 220, 220],
          textColor: [150, 0, 0],
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 105 },
        tableWidth: 85
      });
      
      // Right column: Skin Conditions
      doc.autoTable({
        startY: yPos,
        head: [['Skin Conditions']],
        body: skinData,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 243, 220],
          textColor: [150, 100, 0], 
          fontStyle: 'bold'
        },
        margin: { left: 111, right: 14 },
        tableWidth: 85
      });
      
      // Update Y position (use the lowest of the two tables)
      const allergyEndY = doc.autoTable.previous.finalY;
      yPos = allergyEndY + 10;
      
      // Check if we need a new page for family history
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Family History Section
      if (record.familyHistory && record.familyHistory.length > 0) {
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(14, yPos, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('FAMILY MEDICAL HISTORY', 105, yPos + 5.5, { align: 'center' });
        
        yPos += 15;
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        // Create family history table
        const familyHistoryData = record.familyHistory.map(item => [
          item.relation, item.condition
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Relation', 'Medical Condition']],
          body: familyHistoryData,
          theme: 'striped',
          headStyles: {
            fillColor: [220, 242, 230],
            textColor: [0, 100, 0],
            fontStyle: 'bold'
          },
          margin: { left: 14, right: 14 },
          tableWidth: 182
        });
      }
      
      // Add footer
      const pageCount = doc.internal.pages.length;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `This is a digital medical record for patient use. Generated on ${new Date().toLocaleDateString()}. Page ${i} of ${pageCount}`,
          105,
          285,
          { align: "center" }
        );
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 280, 196, 280);
      }
  
      // THIS IS THE IMPORTANT PART - SAVE PDF
      doc.save(`Medical_Record_${record._id || 'download'}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline-success" 
      onClick={generatePDF} 
      className="d-flex align-items-center"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Generating...
        </>
      ) : (
        <>
          <FaFilePdf className="me-2" />
          Download PDF
        </>
      )}
    </Button>
  );
};

export default GeneratePDF;