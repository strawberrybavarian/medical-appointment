import React from 'react';
import { Carousel, Container } from 'react-bootstrap';
import NavigationalBar from "./navbar";
import './Landing.css';
import { ip } from '../../ContentExport';

function LandingPage() {
  return (
    <>
      <div className='w-100'>
        <NavigationalBar />
      </div>

      {/* Carousel Section */}
      <section id="hero" className="hero section">
        <Carousel id="hero-carousel" className="carousel-fade" interval={5000}>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={`${ip.address}/images/hero-carousel-1.jpg`}
              alt="First slide"
            />
            <Carousel.Caption>
              <h2>Welcome to Medicio</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <a href="#about" className="btn-get-started">Read More</a>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <img
              className="d-block w-100"
              src={`${ip.address}/images/hero-carousel-2.jpg`}
              alt="Second slide"
            />
            <Carousel.Caption>
              <h2>At vero eos et accusamus</h2>
              <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.</p>
              <a href="#about" className="btn-get-started">Read More</a>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <img
              className="d-block w-100"
              src={`${ip.address}/images/hero-carousel-3.jpg`}
              alt="Third slide"
            />
            <Carousel.Caption>
              <h2>Temporibus autem quibusdam</h2>
              <p>Beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
              <a href="#about" className="btn-get-started">Read More</a>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </section>

      {/* Content Section */}
      <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
        <div className='maincolor-container p-0'>
          <div className='content-area p-0'>
            {/* Add Content here */}
          </div>
        </div>
      </Container>
    </>
  );
}

export default LandingPage;
