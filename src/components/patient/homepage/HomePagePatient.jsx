import { Carousel } from 'react-bootstrap';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import Image1 from './images/Jeno.jpg';
import Image2 from './images/Mark.jpg';
import Image3 from './images/Sohee.jpg';
import './HomePagePatient.css';
import DoctorSpecialty from './DoctorSpecialty';
import { useParams } from 'react-router-dom';

function HomePagePatient() {

 const { pid } = useParams();
 console.log(pid);

 return (
   <>
     <PatientNavBar />

     <div className='hp-container'>
       <Carousel data-bs-theme="dark" className='hp-carouselsize'>
         <Carousel.Item>
           <img
             className="d-block w-100"
             src={Image1}
             alt="First slide"
           />
           <Carousel.Caption>
             <h5>Miss Jade So - DRPH - Season 2</h5>
             <p>You Better Work. Hun.</p>
           </Carousel.Caption>
         </Carousel.Item>
         <Carousel.Item>
           <img
             className="d-block w-100"
             src={Image2}
             alt="Second slide"
           />
           <Carousel.Caption>
             <h5>Nymphia Wind</h5>
             <p>I love Bananas!.</p>
           </Carousel.Caption>
         </Carousel.Item>
         <Carousel.Item>
           <img
             className="d-block w-100"
             src={Image3}
             alt="Third slide"
           />
           <Carousel.Caption>
             <h5>Third slide label</h5>
             <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
           </Carousel.Caption>
         </Carousel.Item>
       </Carousel>
     </div>
     <DoctorSpecialty pid={pid} />
   </>
 );
}

export default HomePagePatient;
