import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Trucks from './pages/Trucks';
import Tracking from './pages/Tracking';
import OwnerDashboard from './pages/OwnerDashboard';
import DriverApp from './pages/DriverApp';
import NotFound from './pages/NotFound';
import OwnerLogin from './pages/OwnerLogin';
import LiveBookings from './pages/admin/LiveBookings';

function AppLayout() {
  const location = useLocation();

  const isDashboardPage =
    location.pathname === '/owner/dashboard' ||
    location.pathname === '/driverapp';

  return (
    <div className="page-wrapper">
      {!isDashboardPage && <Navbar />}

      <main
        className="main-content"
        style={{
          padding: isDashboardPage ? '0' : undefined,
          margin: isDashboardPage ? '0' : undefined,
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trucks" element={<Trucks />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/tracking/:bookingId" element={<Tracking />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/driver" element={<DriverApp />} />
          <Route path="/driver/app" element={<DriverApp />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/owner" element={<OwnerLogin />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/admin/live-bookings" element={<LiveBookings />} />
        </Routes>
      </main>

      {!isDashboardPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;