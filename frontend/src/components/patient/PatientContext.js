import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ip } from '../../ContentExport';

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientSession = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/patient/get/session`, {
          withCredentials: true,
        });
        if (response.data.patient) {
          setPatient(response.data.patient);
        } else {
          console.log('Session expired: Clearing patient context');
          setPatient(null);
          // navigate('/medapp/login'); // Redirect to login if session is expired
        }
      } catch (error) {
        console.error('Failed to fetch patient session:', error);
        setPatient(null);
        // navigate('/medapp/login'); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchPatientSession();

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${ip.address}/api/patient/get/session`, {
          withCredentials: true,
        });
        if (!response.data.patient) {
          console.log('Session expired: Clearing patient context');
          clearInterval(interval);
          setPatient(null); // Clear patient context
          // navigate('/medapp/login'); // Redirect to login when session expires
        }
      } catch (error) {
        console.error('Session check failed:', error);
        clearInterval(interval);
        setPatient(null); // Clear patient context on error
        // navigate('/medapp/login'); // Redirect to login on error
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Optional: Add a global loading spinner
  }

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};
