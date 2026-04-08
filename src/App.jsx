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
import BidderAuctionRoom from './pages/bidder/BidderAuctionRoom';
import AuctionListPage from './pages/bidder/AuctionListPage';
import BidderSearchResultPage from './pages/bidder/BidderSearchResultPage';
import AuctionDetailHomePage from './pages/bidder/AuctionDetailHomePage';
import OAuthSuccessPage from './components/OAuthSuccessPage';
import TopupPage from './pages/payment/TopupPage';
import WinningAuctionHistoryPage from './pages/payment/WinningAuctionHistoryPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />
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

            <Route path="/" element={<BidderLayout />}>
              <Route path="dashboard" element={<BidderHomePage />} />
              <Route path="auctions" element={<AuctionListPage />} />
              <Route
                path="auctions/:auctionId"
                element={<AuctionDetailHomePage />}
              />
              <Route path="search" element={<BidderSearchResultPage />} />
              <Route
                path="bidder/auctions"
                element={<MyParticipatedAuctionsPage />}
              />
              <Route
                path="bidder/auctions/:auctionId"
                element={<BidderAuctionRoom />}
              />
              <Route
                path="bidder/history"
                element={<WinningAuctionHistoryPage />}
              />
              <Route path="bidder/won" element={<SellerAuctionPage />} />
            </Route>

            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfileInfo />} />
              <Route path="address" element={<ProfileAddressPage />} />
              <Route path="topup" element={<TopupPage />} />
              {/* <Route path="settings" element={<ProfileSettings />} /> */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
