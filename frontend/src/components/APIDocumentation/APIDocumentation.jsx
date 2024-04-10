import React from 'react';
import { useNavigate } from "react-router-dom";
import './APIDocumentation.css';
import Header from '../Header/Header';

const APIDocumentation = () => {

    const navigate = useNavigate();

    const toggleReturn = () => {
        navigate("/");
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex justify-left items-left flex-col m-20">
                <div className="text-left">
                <button className="hover:scale-105 transition-all duration-300 text-xs py-2 px-4 rounded mt-10 mb-7 " onClick={toggleReturn}>
                        Return
                    </button>
                    <div className="text-xl font-poppins">
                        API Docs <br />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIDocumentation;