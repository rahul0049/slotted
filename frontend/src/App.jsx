import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import EventDetail from './pages/EventDetail.jsx';
import WaitingRoom from './pages/WaitingRoom.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import BookingConfirm from './pages/BookingConfirm.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

// simple auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/queue/:providerId" element={
            <PrivateRoute><WaitingRoom /></PrivateRoute>
          } />
          <Route path="/select/:providerId" element={
            <PrivateRoute><SeatSelection /></PrivateRoute>
          } />
          <Route path="/confirm/:bookingId" element={
            <PrivateRoute><BookingConfirm /></PrivateRoute>
          } />
          <Route path="/success/:bookingId" element={
            <PrivateRoute><PaymentSuccess /></PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}