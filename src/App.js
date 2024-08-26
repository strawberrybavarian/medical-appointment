import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';


//Component
import LandingPage from './components/landpage/LandingPage';
import LogInUser from './components/login/LogInUser';
import NewSignUp from './components/login/NewSignUp';
import VerifyOTP from './components/login/VerifyOTP';

//Practitioner
import DashboardMain from './components/practitioner/dashboard/DashboardMain';

import EditMode from './components/practitioner/editmode/EditMode';
import TheAppointments from './components/practitioner/appointment/TheAppointmentsNav';


import AccountInfo from './components/practitioner/accountinfo/AccountInfo';
import MainMedicalRecord from './components/practitioner/medicalrecord/MainMedicalRecord';
import DoctorProfile from './components/patient/doctorprofile/DoctorProfile';
import PendingAppointment from './components/practitioner/appointment/TheAppointmentsNav';
import AppointmentForm from './components/patient/doctorprofile/AppointmentForm';
//Patient
import HomePagePatient from './components/patient/homepage/HomePagePatient';
import ChooseDoctor from './components/patient/choosedoctor/choosedoctor';

import MyAppointment from './components/patient/scheduledappointment/MyAppointment';
import MainPatientInformation from './components/patient/patientinformation/MainPatientInformation';
import DoctorInformation from './components/practitioner/accountinfo/DoctorInformation';
import ChooseDoctorSpecialization from './components/patient/choosedoctor/ChooseDoctorSpecialization';
import MainInformation from './components/practitioner/patientinformation/MainInformation';

//Staff Login
import StaffLogIn from './components/staffs/login page/StaffLogin';

// Medical Secretary
import MedSecMain from './components/staffs/medical secretary/components/Main/MedSecMain';
import CreatePatient from './components/staffs/medical secretary/components/Add Patient/Main/CreatePatientMain';


//Cashier
import CashierMain from './components/staffs/cashier/main page/CashierMain';

//Admin
import AdminDashboard from './components/staffs/admin/dashboard/AdminDashboard';





function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>

          <Route path={'/'} element={<LandingPage/>}></Route>
          <Route path={'/medapp/signup'} element={<NewSignUp/>}> </Route>
          <Route path={'/medapp/login'} element={<LogInUser/>}> </Route>
          <Route path={'/verify-otp'} element={<VerifyOTP/>}> </Route>
        {/* Practitioner Routes */}
          <Route path={"/dashboard/:did"} element={<DashboardMain />}/>
          <Route path={"/dashboard/edit/:uid/:index"}element={<EditMode/>}/>  
          <Route path={'/mainappointment/:did'} element={<TheAppointments/>}></Route>
          <Route path={'/medicalrecord/:did'} element={<MainMedicalRecord/>}/>
          <Route path={"/information/:pid/:did/:apid"} element={<MainInformation />}/>
          <Route path={"/account/:did"} element={<DoctorInformation />}/>
        
        {/* Patient Routes */}
          <Route path={"/homepage/:pid"} element={<HomePagePatient />}/>
          <Route path={"/choosedoctor/:pid"} element={<ChooseDoctor />}/>
          <Route path={"/:specialty/choosedoctor/:pid"} element={<ChooseDoctorSpecialization />} />
          <Route path={"/doctorprofile/:pid/:did"} element={<DoctorProfile />}/>
          <Route path={"/myappointment/:pid"} element={<MyAppointment />}/>
          <Route path={"/accinfo/:pid"} element={<MainPatientInformation />}/>
          <Route path={"/appointment/:pid/:did"} element={<AppointmentForm />} />
        {/* Staff Login */}
          <Route path={"/staffs"} element={<StaffLogIn />}/>

        {/* Medical Secretary Routes */}
          <Route path={"/medsec/:msid"} element={<MedSecMain />}/>
          <Route path={"/medsec/createpatient/:msid"} element={<CreatePatient />}/>
        
        {/* Cashier Routes */}
          <Route path={"/cashier/:cid"} element={<CashierMain />}/>

        {/* Admin Routes */}
          <Route path={"/admin/dashboard/:aid"} element={<AdminDashboard />}/>
      </Routes>
    </BrowserRouter>


    

  



    </>
  );
}

  
export default App;
