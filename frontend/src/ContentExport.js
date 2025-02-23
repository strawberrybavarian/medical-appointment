import axios from "axios";

const image = {
    // logo: "https://medical-appointment-qiih.onrender.com/images/Molino-Polyclinic-Logo.png",
    logo: "http://localhost:8000/images/Molino-Polyclinic-Logo.png",
};

const ip ={
    // address: 'https://medical-appointment-qiih.onrender.com'


    address: 'http://localhost:8000'

};

axios.defaults.baseURL = ip.address;
axios.defaults.withCredentials = true;



const specialties = [
    "Neurology",
    "Cardiology",
    "Endocrinology",
    "Dermatology",
    "Hematology",
    "Urology",
    "Gastroenterology",
    "Pediatric Cardiology",
    "Pediatric Surgery",
    "Pulmonology",
    "Orthopedic Surgery",
    "General Surgery",
    "Infectiology",
    "Opthalmology",
    "Pediatrics",
    "Internal Medicine",
    "Family Medicine",
    "General Medicine"
];
export {
    image,
    specialties,
    ip
}


