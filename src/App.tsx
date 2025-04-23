import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './components/About';
import InteractiveLogo from './components/InteractiveLogo';
import CateringPromo from './components/CateringPromo';
import SocialLinks from './components/SocialLinks';
import Hero from './components/Hero';
import Schedule from './components/Schedule';
import MenuPreview from './components/MenuPreview';
import Newsletter from './components/Newsletter';
import Menu from './pages/Menu';
import Order from './pages/Order';
import OrderConfirmation from './pages/OrderConfirmation';
import Catering from './pages/Catering';
import Locate from './pages/Locate';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminMenu from './pages/admin/Menu';
import AdminSchedule from './pages/admin/Schedule';
import AdminBlog from './pages/admin/Blog';
import ScrollToTop from './components/ScrollToTop'

function Home() {
  return (
    <>
      <Hero />
      <About />
      <InteractiveLogo />
      <Schedule />
      <MenuPreview />
      <CateringPromo />
      <SocialLinks />
      <Newsletter />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop/>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order" element={<Order />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/locate" element={<Locate />} />
          <Route path="/order/confirmation" element={<OrderConfirmation />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="blog" element={<AdminBlog />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
