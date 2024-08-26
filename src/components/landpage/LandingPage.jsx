import { Container } from 'react-bootstrap';
import "./Landing.css";
import NavigationalBar from "./navbar";

function LandingPage() {
  return (
    <>
      <NavigationalBar />
      <Container fluid className="p-0">
        <div className="lnd-img-container">
          <img src={`http://localhost:8000/images/landingpage.png`} className='lnd-img' alt="Landing Page" />
        </div>
      </Container>
    </>
  );
}

export default LandingPage;
