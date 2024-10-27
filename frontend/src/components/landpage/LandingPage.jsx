import React, { useRef, useState, useEffect } from "react";
import NavigationalBar from "./navbar";
import './Landing.css';
import './LandingPage.css';
import Footer from "../Footer";
import NewsSection from "../staffs/news/NewsSection";
import { ip } from "../../ContentExport";
import { Button } from "react-bootstrap";

function LandingPage() {
  const topRef = useRef(null);      // Ref for the top of the page
  const servicesRef = useRef(null); // Ref for the services section
  const aboutRef = useRef(null);    // Ref for the about section
  const newsRef = useRef(null);     // Ref for the news section

  const [showButton, setShowButton] = useState(false); // State to control visibility

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToNews = () => {
    newsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Throttle scroll handler to improve performance
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  // Attach the scroll event listener inside useEffect
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div style={{ overflowY: "auto", overflowX: "hidden", height: "calc(100vh)" }}>
        {/* Top Reference */}
        <div ref={topRef} />

        <NavigationalBar
          scrollToServices={scrollToServices}
          scrollToAbout={scrollToAbout}
          scrollToNews={scrollToNews}
        />

        <div className="maincolor-container p-0 m-0">
          <div className="content-area m-0 p-0">
            <div
              id="hero-carousel"
              className="carousel slide carousel-fade"
              data-bs-ride="carousel"
              data-bs-interval="5000"
              style={{ width: "100%", position: "relative" }}
            >
              <div className="carousel-item active">
                <img
                  src={`${ip.address}/images/Landing-Page.png`}
                  alt=""
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "800px",
                    maxWidth: "100vw",
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
                </div>
              </div>
            </div>
          </div>

          <section
            id="about"
            ref={aboutRef}
            style={{ padding: "50px", backgroundColor: "#f7f7f7" }}
          >
            <div className="section-title" data-aos="fade-up">
              <h2>About Us<br /></h2>
              <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
            </div>
          </section>

          <section
            id="services"
            ref={servicesRef}
            style={{ padding: "50px", backgroundColor: "#f7f7f7" }}
          >
            <h2>Our Services</h2>
            <p>Here are the services we offer...</p>
          </section>

          <section
            id="news"
            ref={newsRef}
            style={{ padding: "50px", backgroundColor: "#f7f7f7" }}
          >
            <NewsSection />
          </section>

          {/* Back to Top Button */}
          {showButton && (
            <Button
              className="back-to-top-button"
              onClick={scrollToTop}
              aria-label="Back to Top"
            >
              ⬆
            </Button>
          )}

          <Footer />
        </div>
      </div>
    </>
  );
}

export default LandingPage;
