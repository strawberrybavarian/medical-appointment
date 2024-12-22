// UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ip } from '../ContentExport';
const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // store partial user info
  const [role, setRole] = useState(null); // 'Physician' or 'Patient'
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/get/session`, {
          withCredentials: true,
        });
        if (response.data.user) {
          setUser(response.data.user);
          setRole(response.data.role);
          console.log('Active session found:', response.data.user);
        } else {
          setUser(null);
          setRole(null);
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
    
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, role, setUser, setRole }}>
      {children}
    </UserContext.Provider>
  );
};