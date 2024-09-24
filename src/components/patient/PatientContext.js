import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the PatientContext
const PatientContext = createContext();

// Hook to use the PatientContext
export const usePatient = () => useContext(PatientContext);

// PatientProvider to wrap around components that need access to patient data
export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(() => {
    // Load patient data from localStorage on initial render
    const savedPatient = localStorage.getItem('patient');
    return savedPatient ? JSON.parse(savedPatient) : null;
  });

  useEffect(() => {
    // Update localStorage whenever patient state changes
    if (patient) {
      localStorage.setItem('patient', JSON.stringify(patient));
    }
  }, [patient]);

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};
