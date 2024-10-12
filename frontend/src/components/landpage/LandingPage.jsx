import { Container } from 'react-bootstrap';
import "./Landing.css";
import NavigationalBar from "./navbar";
import { ip } from '../../ContentExport';
function LandingPage() {
  return (
    <>
      <NavigationalBar />
      <Container fluid className="p-0">
        <div className="lnd-img-container">
          <img src={`${ip.address}/images/landingpage.png`} className='lnd-img' alt="Landing Page" />
        </div>
      </Container>
    </>
  );
}

export default LandingPage;
