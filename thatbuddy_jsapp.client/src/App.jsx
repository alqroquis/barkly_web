import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Navbar from '../src/components/navbar'
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Footer from "./components/footer";
import React from "react";
import { ToastContainer } from "react-toastify";
import Profile from '../src/pages/Profile';
import "react-toastify/dist/ReactToastify.css";
import HeatmapPage from '../src/pages/Maps';

function App() {
    return (
        <AuthProvider>
            <Navbar />
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/maps" element={<HeatmapPage />} />
                </Routes>
            </Router>
            <Footer />
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </AuthProvider>
    );
}

export default App;