import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import { Rotate3D } from 'lucide-react';
import RegisterPage from './pages/RegisterPage';
import SellerLayout from './layouts/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import MyAuctions from './pages/seller/MyAuctions';
import CreateAuction from './pages/seller/CreateAuction';
import AuctionDetail from './pages/seller/auction-detail';
import ProfileLayout from './layouts/ProfileLayout';
import ProfileInfo from './pages/profile/ProfileInfo';
import ProfileAddressPage from './pages/profile-address/ProfileAddressPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />}></Route>
          </Route>

          {/* Private Routes*/}
          <Route element={<ProtectedRoute />}>
            <Route path="/seller" element={<SellerLayout />}>
              <Route path="dashboard" element={<SellerDashboard />} />
              <Route path="auctions" element={<MyAuctions />} />
              <Route path="create" element={<CreateAuction />} />
              <Route path="auctions/:auctionId" element={<AuctionDetail />} />
            </Route>
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfileInfo />} />
              <Route path="address" element={<ProfileAddressPage />} />
              {/* <Route path="settings" element={<ProfileSettings />} /> */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
