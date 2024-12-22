import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ip } from '../../ContentExport';

const DoctorContext = createContext();

export const useDoctor = () => useContext(DoctorContext);

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorSession = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/doctor/get/session`, {
          withCredentials: true,
        });
        if (response.data.doctor) {
          setDoctor(response.data.doctor);
        } else {
          console.log('Session expired: Clearing doctor context');
          setDoctor(null);
        //   navigate('/medapp/login'); // Redirect to login if session is expired
        }
      } catch (error) {
        console.error('Failed to fetch doctor session:', error);
        setDoctor(null);
        // navigate('/medapp/login'); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorSession();

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${ip.address}/api/doctor/get/session`, {
          withCredentials: true,
        });
        if (!response.data.doctor) {
          console.log('Session expired: Clearing doctor context');
          clearInterval(interval);
          setDoctor(null); // Clear doctor context
        //   navigate('/medapp/login'); // Redirect to login when session expires
        }
      } catch (error) {
        console.error('Session check failed:', error);
        clearInterval(interval);
        setDoctor(null); // Clear doctor context on error
        // navigate('/medapp/login'); // Redirect to login on error
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Optional: Add a global loading spinner
  }

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
};
