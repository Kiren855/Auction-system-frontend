import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import RegisterPage from './pages/RegisterPage';
import SellerLayout from './layouts/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import AuctionDetail from './pages/seller/auction-detail';
import ProfileLayout from './layouts/ProfileLayout';
import ProfileInfo from './pages/profile/ProfileInfo';
import ProfileAddressPage from './pages/profile-address/ProfileAddressPage';
import SellerAuctionPage from './pages/seller/SellerAuctionPage';
import CreateAuctionProductPage from './pages/seller/CreateAuctionProductPage';
import { CreateAuctionProvider } from './context/CreateAuctionContext';
import CreateAuctionAuctionPage from './pages/seller/CreateAuctionAuctionPage';

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
              {/* Auction router */}
              <Route path="auctions" element={<SellerAuctionPage />} />
              <Route
                path="auctions/create/product"
                element={
                  <CreateAuctionProvider>
                    <CreateAuctionProductPage />
                  </CreateAuctionProvider>
                }
              />
              <Route
                path="auctions/create/auction"
                element={
                  <CreateAuctionProvider>
                    <CreateAuctionAuctionPage />
                  </CreateAuctionProvider>
                }
              />
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
