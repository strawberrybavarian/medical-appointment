import React from "react";
import { image } from "../ContentExport";
import { Container } from "react-bootstrap";
import { TwitterX, Facebook, Instagram, Linkedin } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <footer id="footer" className="footer light-background">
      <Container className="footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <a href="/" className=" d-flex align-items-center">
              <div className="p-0 m-0" style={{ height: '100px' }}>
                <img src={image.logo} alt="Logo" style={{ width: '12.5rem', height: '100%' }} />
              </div>
            </a>
            <div className="footer-contact pt-3">
        
              <p>Molino Boulevard, Molino 3</p>
              <p>Bacoor, Philippines</p>
              <p className="mt-3"><strong>Phone:</strong> <span>+1 5589 55488 55</span></p>
              <p><strong>Email:</strong> <span>info@example.com</span></p>
            </div>
            <div className="social-links d-flex mt-4">
              <a href=""><TwitterX /></a>
              <a href="https://www.facebook.com/MolinoPolyclinic/"><Facebook /></a>
              <a href=""><Instagram /></a>
              <a href=""><Linkedin /></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About us</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Terms of service</a></li>
              <li><a href="#">Privacy policy</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><a href="#">Web Design</a></li>
              <li><a href="#">Web Development</a></li>
              <li><a href="#">Product Management</a></li>
              <li><a href="#">Marketing</a></li>
              <li><a href="#">Graphic Design</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Hic solutasetp</h4>
            <ul>
              <li><a href="#">Molestiae accusamus iure</a></li>
              <li><a href="#">Excepturi dignissimos</a></li>
              <li><a href="#">Suscipit distinctio</a></li>
              <li><a href="#">Dilecta</a></li>
              <li><a href="#">Sit quas consectetur</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Nobis illum</h4>
            <ul>
              <li><a href="#">Ipsam</a></li>
              <li><a href="#">Laudantium dolorum</a></li>
              <li><a href="#">Dinera</a></li>
              <li><a href="#">Trodelas</a></li>
              <li><a href="#">Flexo</a></li>
            </ul>
          </div>
        </div>
      </Container>

      <Container className="copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">Molino Polyclinic</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          {/* Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a> */}
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
