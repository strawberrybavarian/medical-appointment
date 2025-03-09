import React from 'react';
import { FaCheck } from 'react-icons/fa';


const PasswordValidation = ({ password }) => {
    const validations = {
        length: password.length >= 8,
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        upperCase: /[A-Z]/.test(password),
        lowerCase: /[a-z]/.test(password),
    };

    return (
        <div className="password-validation">
            <div className={validations.length ? 'valid' : 'invalid'}>
                {validations.length && <FaCheck className="check-icon" />}
                Password should be at least 8 characters long
            </div>
            <div className={validations.specialChar ? 'valid' : 'invalid'}>
                {validations.specialChar && <FaCheck className="check-icon" />}
                Password should contain a special character
            </div>
            <div className={validations.upperCase ? 'valid' : 'invalid'}>
                {validations.upperCase && <FaCheck className="check-icon" />}
                Password should contain at least one uppercase letter
            </div>
            <div className={validations.lowerCase ? 'valid' : 'invalid'}>
                {validations.lowerCase && <FaCheck className="check-icon" />}
                Password should contain at least one lowercase letter
            </div>
        </div>
    );
};

export default PasswordValidation;
