import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the PatientContext
const PatientContext = createContext();

// Hook to use the PatientContext
export const usePatient = () => useContext(PatientContext);

// PatientProvider to wrap around components that need access to patient and doctor data
export const PatientProvider = ({ children }) => {
  // Load initial state from localStorage
  const [patient, setPatient] = useState(() => {
    const savedPatient = localStorage.getItem('patient');
    return savedPatient ? JSON.parse(savedPatient) : null;
  });

  const [doctorId, setDoctorId] = useState(() => {
    const savedDoctorId = localStorage.getItem('doctorId');
    return savedDoctorId ? JSON.parse(savedDoctorId) : null;
  });

  useEffect(() => {
    // Update localStorage whenever patient or doctorId state changes
    if (patient) {
      localStorage.setItem('patient', JSON.stringify(patient));
    } else {
      localStorage.removeItem('patient');
    }

    if (doctorId) {
      localStorage.setItem('doctorId', JSON.stringify(doctorId));
    } else {
      localStorage.removeItem('doctorId');
    }
  }, [patient, doctorId]);

  return (
    <PatientContext.Provider value={{ patient, setPatient, doctorId, setDoctorId }}>
      {children}
    </PatientContext.Provider>
  );
};
