import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import RegisterPage from './pages/RegisterPage';
import SellerLayout from './layouts/SellerLayout';
import BidderLayout from './layouts/BidderLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import ProfileLayout from './layouts/ProfileLayout';
import ProfileInfo from './pages/profile/ProfileInfo';
import ProfileAddressPage from './pages/profile-address/ProfileAddressPage';
import SellerAuctionPage from './pages/seller/SellerAuctionPage';
import CreateAuctionProductPage from './pages/seller/CreateAuctionProductPage';
import { CreateAuctionProvider } from './context/CreateAuctionContext';
import CreateAuctionAuctionPage from './pages/seller/CreateAuctionAuctionPage';
import AuctionDetailPage from './pages/auction/AuctionDetailPage';
import ProductListPage from './pages/seller/ProductListPage';
import BidderHomePage from './pages/bidder/BidderHomePage';
import MyParticipatedAuctionsPage from './pages/bidder/MyParticipatedAuctionsPage';

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
              <Route path="products" element={<ProductListPage />} />
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
              <Route
                path="auctions/:auctionId"
                element={<AuctionDetailPage />}
              />
            </Route>

            <Route path="/bidder" element={<BidderLayout />}>
              <Route path="dashboard" element={<BidderHomePage />} />
              <Route path="auctions" element={<MyParticipatedAuctionsPage />} />
              <Route path="history" element={<SellerAuctionPage />} />
              <Route path="won" element={<SellerAuctionPage />} />
              <Route
                path="auctions/:auctionId"
                element={<AuctionDetailPage />}
              />
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
