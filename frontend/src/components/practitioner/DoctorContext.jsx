import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the DoctorContext
const DoctorContext = createContext();

// Hook to use the DoctorContext
export const useDoctor = () => useContext(DoctorContext);

// DoctorProvider to wrap around components that need access to doctor data
export const DoctorProvider = ({ children }) => {
    // Load initial state from localStorage
    const [doctor, setDoctor] = useState(() => {
        const savedDoctor = localStorage.getItem('doctor');
        return savedDoctor ? JSON.parse(savedDoctor) : null;
    });

    useEffect(() => {
        // Update localStorage whenever doctor state changes
        if (doctor) {
            localStorage.setItem('doctor', JSON.stringify(doctor));
        } else {
            localStorage.removeItem('doctor');
        }
    }, [doctor]);

    return (
        <DoctorContext.Provider value={{ doctor, setDoctor }}>
            {children}
        </DoctorContext.Provider>
    );
};
