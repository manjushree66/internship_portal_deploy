import { BrowserRouter, Routes, Route } from "react-router-dom";

import LayoutStudent from "./components/LayoutStudent";
import LayoutFaculty from "./components/LayoutFaculty";
import LayoutManager from "./components/LayoutManager";
import LayoutAdmin from "./components/LayoutAdmin";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import InternshipForm from "./pages/InternshipForm";
import InternshipStatus from "./pages/InternshipStatus";
import InternshipReport from "./pages/InternshipReport";

import ChatbotPage from "./pages/ChatbotPage";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login Page (No Sidebar/Navbar/Footer) */}
        <Route path="/" element={<Login />} />
{/* Faculty Dashboard */}
<Route
  path="/faculty"
  element={
    <LayoutFaculty>
      <FacultyDashboard />
    </LayoutFaculty>
  }
/>

{/* Admin Dashboard */}
<Route
  path="/admin"
  element={
    <LayoutAdmin>
      <AdminDashboard />
    </LayoutAdmin>
  }
/>

{/* Manager Dashboard */}
<Route
  path="/manager"
  element={
    <LayoutManager>
      <ManagerDashboard />
    </LayoutManager>
  }
/>
        {/* Dashboard */}
        <Route
  path="/dashboard"
  element={
    <LayoutStudent>
      <Dashboard />
    </LayoutStudent>
  }
/>
        {/* Profile */}
        <Route
  path="/profile"
  element={
    <LayoutStudent>
      <Profile />
    </LayoutStudent>
  }
/>

        {/* Internship Form */}
        <Route
  path="/internship-form"
  element={
    <LayoutStudent>
      <InternshipForm />
    </LayoutStudent>
  }
/>

        {/* Internship Status */}
        <Route
          path="/status"
          element={
            <LayoutStudent><InternshipStatus />
            </LayoutStudent>
              
            
          }
        />
        <Route
         path="/internship-report"
         element={
         <LayoutStudent>
         <InternshipReport />
         </LayoutStudent>
         }
        />

        

        
        
     

        {/* Chatbot */}
        <Route
          path="/chatbot"
          element={
            <LayoutStudent>
              <ChatbotPage />
            </LayoutStudent>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;