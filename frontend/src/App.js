import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";
import Checkout from "./pages/checkout/Checkout";
import Success from "./pages/checkout/Success";
import Cancel from "./pages/checkout/Cancel";
import ShippingPolicy from "./pages/policies/ShippingPolicy";
import RefundPolicy from "./pages/policies/RefundPolicy";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsOfService from "./pages/policies/TermsOfService";
import MembershipTerms from "./pages/policies/MembershipTerms";
import ContactPage from "./pages/policies/ContactPage";
import DeliveryWorks from "./pages/policies/DeliveryWorks";
import MembershipDetail from "./pages/membership/MembershipDetail";
import ShopBoxes from "./pages/ShopBoxes";
import BuildYourBox from "./pages/BuildYourBox";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "./components/ui/sonner";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/shop-boxes" element={<ShopBoxes />} />
              <Route path="/build-your-box" element={<BuildYourBox />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<Success />} />
              <Route path="/checkout/cancel" element={<Cancel />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/membership-terms" element={<MembershipTerms />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/delivery" element={<DeliveryWorks />} />
              <Route path="/membership/:plan" element={<MembershipDetail />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Customer Portal Routes */}
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/portal" element={<CustomerDashboard />} />
              <Route path="/portal/profile" element={<CustomerProfile />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="bottom-right" />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
