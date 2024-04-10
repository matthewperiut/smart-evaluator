import React from 'react';
import { useNavigate } from "react-router-dom";
import './LandingPage.css';
import Header from '../Header/Header';

const LandingPage = () => {

    const navigate = useNavigate();

    const toggleHome = () => {
        navigate("/home");
    };

    const toggleAPIDocs = () => {
        navigate("/apidocs");
    }

    const toggleHelp = () => {
        navigate("/help");
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex justify-center items-center flex-col animated fadeIn">
                <div className="text-center">
                    <div className="text-xl font-poppins">
                        CribMaster <br />
                        Smart Evaluator
                    </div>
                    <button className="hover:scale-105 transition-all duration-300 text-xs py-2 px-4 rounded mt-4 " onClick={toggleHome}>
                        Get Started
                    </button>
                </div>
            </div>
            <footer className="flex justify-center items-center bg-dark-green h-16 bg-gray-200 mt-auto hei">
                <button className="hover:scale-105 transition-all duration-300 py-2 px-4 rounded mx-2" onClick={toggleAPIDocs}>
                    API Documentation
                </button>
                <button className="hover:scale-105 transition-all duration-300 py-2 px-4 rounded mx-2" onClick={toggleHelp}>
                    Help
                </button>
            </footer>
        </div>
    );
};

export default LandingPage;

