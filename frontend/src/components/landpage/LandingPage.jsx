import React, { useRef } from "react";
import NavigationalBar from "./navbar";
import './Landing.css';
import { ip, image } from "../../ContentExport";
import Footer from "../Footer";

function LandingPage() {
  // Create a reference to the Services section
  const servicesRef = useRef(null);
  const aboutRef = useRef(null);
  // Function to scroll to the Services section
  const scrollToServices = () => {
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Navbar */}
      <div className="w-100">
        <NavigationalBar scrollToServices={scrollToServices} scrollToAbout={scrollToAbout} />
      </div>

      {/* Content Section */}
      <div style={{ overflowY: "auto", overflowX: "hidden", height: "calc(100vh)", paddingBottom: "1.5rem" }}>
        <div className="maincolor-container p-0">
          <div className="content-area" style={{ marginTop: "5.4rem" }}>
            {/* Hero Carousel */}
            <div
              id="hero-carousel"
              className="carousel slide carousel-fade"
              data-bs-ride="carousel"
              data-bs-interval="5000"
              style={{ width: "100%" }}
            >
              <div className="carousel-item active">
                <img
                  src={`${ip.address}/images/Landing-Page.png`}
                  alt=""
                  style={{
                    objectFit: "cover",
                    width: "100%",  // Ensure it fits the container
                    height: "800px",
                    maxWidth: "100vw",  // Prevent overflow from large images
                  }}
                />
                <div className="hero-absolute">
                  
                  <h2 className="display-4 text-white fw-bold mb-4">
                    Welcome to Molino Care App
                  </h2>
                  
                  <p className="lead text-white mb-4">
                    Medical Functional is most focused in helping you <br />
                    discover your most beautiful smile.
                  </p>
                  <a href="#about" className="btn btn-primary btn-lg">
                    Read More
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* About Us Section */}
          <section
            id="about"
            ref={aboutRef}
            style={{ padding: "50px", backgroundColor: "#f7f7f7" }}
          >
            <div class="container section-title" data-aos="fade-up">
              <h2>About Us<br/></h2>
              <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
            </div>
          </section>         
          {/* Services Section */}
          <section
            id="services"
            ref={servicesRef}
            style={{ padding: "50px", backgroundColor: "#f7f7f7" }}
          >
            <h2>Our Services</h2>
            <p>Here are the services we offer...</p>
          </section>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
}

export default LandingPage;
