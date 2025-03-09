import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Navbar from '../src/components/navbar'
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Footer from "./components/footer";
import React from "react";


function App() {
    return (
        <AuthProvider>
            <Navbar />
            <Router>
                <Routes>
                    <Route path="/" element={<Home/>} />
                </Routes>
            </Router>
            <Footer/>
        </AuthProvider>
    );
}

export default App;