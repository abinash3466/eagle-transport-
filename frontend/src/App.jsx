import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Trucks from "./pages/Trucks";
import Tracking from "./pages/Tracking";
import OwnerDashboard from "./pages/OwnerDashboard";
import DriverApp from "./pages/DriverApp";
import NotFound from "./pages/NotFound";
import OwnerLogin from "./pages/OwnerLogin";
import LiveBookings from "./pages/admin/LiveBookings";

function AppLayout() {
  const location = useLocation();

  const currentPath = location.pathname;

  /* =========================================
     PAGES WITHOUT NAVBAR
  ========================================= */

  const hideNavbar =
    currentPath === "/owner/dashboard" ||
    currentPath === "/driver" ||
    currentPath === "/driver/app";

  /* =========================================
     PAGES WITHOUT FOOTER
  ========================================= */

  const hideFooter =
    currentPath === "/owner" ||
    currentPath === "/owner/login" ||
    currentPath === "/owner/dashboard" ||
    currentPath === "/driver" ||
    currentPath === "/driver/app";

  /* =========================================
     FULL SCREEN PAGES
  ========================================= */

  const isFullScreenPage =
    currentPath === "/owner/dashboard" ||
    currentPath === "/driver" ||
    currentPath === "/driver/app";

  return (
    <div className="page-wrapper">
      {/* NAVBAR */}
      {!hideNavbar && <Navbar />}

      {/* MAIN CONTENT */}
      <main
        className="main-content"
        style={{
          padding: isFullScreenPage ? "0" : undefined,
          margin: isFullScreenPage ? "0" : undefined,
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />

          <Route
            path="/trucks"
            element={<Trucks />}
          />

          <Route
            path="/tracking"
            element={<Tracking />}
          />

          <Route
            path="/tracking/:bookingId"
            element={<Tracking />}
          />

          {/* OWNER */}
          <Route
            path="/owner"
            element={<OwnerLogin />}
          />

          <Route
            path="/owner/login"
            element={<OwnerLogin />}
          />

          <Route
            path="/owner/dashboard"
            element={<OwnerDashboard />}
          />

          {/* DRIVER */}
          <Route
            path="/driver"
            element={<DriverApp />}
          />

          <Route
            path="/driver/app"
            element={<DriverApp />}
          />

          {/* ADMIN */}
          <Route
            path="/admin/live-bookings"
            element={<LiveBookings />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </main>

      {/* FOOTER */}
      {!hideFooter && <Footer />}
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