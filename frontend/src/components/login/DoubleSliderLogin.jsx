// DoubleSliderLogin.jsx
import React, { useRef, useEffect } from 'react';
import './DoubleSliderLogin.css'; 
import ForLoginAndSignupNavbar from '../landpage/ForLoginAndSignupNavbar';
import Footer from '../Footer';
import { Container } from 'react-bootstrap';

import LogInUser from './LogInUser';
import StaffLogin from '../staffs/login page/StaffLogin';
import { ip } from '../../ContentExport';

export default function DoubleSliderLogin() {

  const containerRef = useRef(null);

  const handleSignUpClick = () => {
    containerRef.current.classList.add('right-panel-active');
  };

  const handleSignInClick = () => {
    containerRef.current.classList.remove('right-panel-active');
  };


  useEffect(() => {
    containerRef.current.classList.remove('right-panel-active');
  }, []);

  return (
    <>
    <div style={{overflowY: "auto", overflowX: "hidden", height: "calc(100vh)"}}>

      <ForLoginAndSignupNavbar />

      <Container
        fluid
        style={{
          backgroundImage: `url(${ip.address}/images/Background-Login1.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >

        <div className="container-doubleslider" id="container" ref={containerRef}>

          <div className="form-container sign-up-container">
            <StaffLogin hideOuterStyles />
          </div>


          <div className="form-container sign-in-container">
            <LogInUser hideOuterStyles />
          </div>


          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1 style={{color:'white'}}>Welcome Back!</h1>
                <p>To keep connected with us, please login with your personal info</p>
                <button className="ghost" id="signIn" onClick={handleSignInClick}>
                  User Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1 style={{color:'white'}}>Hello, Staff!</h1>
                <p>Click below if you're Medical Secretary or Admin</p>
                <button className="ghost" id="signUp" onClick={handleSignUpClick}>
                  Staff Sign In
                </button>
              </div>
            </div>
          </div>
        </div>


      </Container>
      </div>
    </>
  );
}
