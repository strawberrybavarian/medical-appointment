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
import MedSecCalendar from './components/staffs/medical secretary/components/Calendar/MedSecCalendar';
import DoctorCards from './components/staffs/medical secretary/components/Manage Doctors/DoctorCards';
import DoctorScheduleManagement from './components/staffs/medical secretary/components/Manage Doctors/DoctorScheduleManagement';
import MedSecMainDashboard from './components/staffs/medical secretary/components/Dashboard/MedSecMainDashboard';
import ManageDoctorMain from './components/staffs/medical secretary/components/Manage Doctors/ManageDoctorMain';
import AllDoctors from './components/staffs/medical secretary/components/Manage Doctors/AllDoctors';

//Cashier
import CashierMain from './components/staffs/cashier/main page/CashierMain';

//Admin

import PatientMain from './components/staffs/admin/dashboard/patient/PatientMain';
import DoctorMain from './components/staffs/admin/dashboard/doctors/DoctorMain';
import DoctorManagement from './components/staffs/admin/management/account/DoctorManagement';
import PatientManagement from './components/staffs/admin/management/account/PatientManagement';
import NewsDetailPage from './components/staffs/news/NewsDetailPage';
import AdminAppointmentMain from './components/staffs/admin/appointment/AdminAppointmentMain';




function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>

          <Route path={'/'} element={<LandingPage/>}></Route>
          <Route path={'/medapp/signup'} element={<NewSignUp/>}> </Route>
          <Route path={'/medapp/login'} element={<LogInUser/>}> </Route>
          <Route path={'/verify-otp'} element={<VerifyOTP/>}> </Route>
          <Route path={'/news/:id'} element={<NewsDetailPage/>}/>
        {/* Practitioner Routes */}
          <Route path="/dashboard" element={<DashboardMain />} />
          <Route path={'/mainappointment'} element={<TheAppointments/>}></Route>
          <Route path={'/medicalrecord'} element={<MainMedicalRecord/>}/>
          <Route path={"/information/:pid/:did/:apid"} element={<MainInformation />}/>
          <Route path={"/account"} element={<DoctorInformation />}/>
        
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
          <Route path={"/medsec/appointments/:msid"} element={<MedSecMain />}/>
          <Route path={"/medsec/dashboard/:msid"} element={<MedSecMainDashboard />}/>
          <Route path={"/medsec/createpatient/:msid"} element={<CreatePatient />}/>
          <Route path={"/medsec/doctors/:msid"} element={<AllDoctors />}/>
          <Route path={"/medsec/:msid/doctors/:did/schedule"} element={<ManageDoctorMain />} />
          
        
        {/* Cashier Routes */}
          <Route path={"/cashier/:cid"} element={<CashierMain />}/>

        {/* Admin Routes */}
          <Route path={"/admin/dashboard/patient/:aid"} element={<PatientMain />}/>
          <Route path={"/admin/dashboard/doctor/:aid"} element={<DoctorMain />}/>
          <Route path={"/admin/account/doctor/:aid"} element={<DoctorManagement />}/>
          <Route path={"/admin/account/patient/:aid"} element={<PatientManagement />}/>
          <Route path={"/admin/appointments/:aid"} element={<AdminAppointmentMain />}/>
      
      </Routes>
    </BrowserRouter>


    

  



    </>
  );
}

  
export default App;
