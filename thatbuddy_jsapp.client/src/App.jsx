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
import Shelters from "./pages/Shelters";
import Article from './pages/Article';
import ShelterPage from './pages/Shelters/ShelterPage';
import PetDetails from './pages/Shelters/PetPage';
import UserProfile from "./pages/Users/User";
import TariffsPage from "./pages/Tariffs/TariffsPage";

function App() {
    return (
        <AuthProvider>
            <Navbar />
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/maps" element={<HeatmapPage />} />
                    <Route path="/shelters" element={<Shelters />} />
                    <Route path="/articles/:categorySlug/:articleSlug" element={<Article />} />
                    <Route path="/shelters/:shelterId" element={<ShelterPage />} />
                    <Route path="/shelters/pets/:petId" element={<PetDetails />} />
                    <Route path="/me" element={<UserProfile />} />
                    <Route path="/tariffs" element={<TariffsPage />} />
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