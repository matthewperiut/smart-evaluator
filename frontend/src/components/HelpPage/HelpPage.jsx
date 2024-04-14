import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';

const HelpPage = () => {
  const navigate = useNavigate();

  const toggleReturn = () => {
    navigate('/');
  };

  const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="border border-dark-green rounded-md mb-8">
        <div
          className="flex justify-between items-center px-4 py-2 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <p className="font-poppins m-0">{question}</p>
          <svg
            className={`w-4 h-4 transition-transform transform ${
              isOpen ? 'rotate-90' : 'rotate-0'
            }`}
            fill="none"
            stroke="#145a32"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? 'M9 5l7 7-7 7' : 'M7 5l7 7-7 7'}
            />
          </svg>
        </div>
        <div
          className={`bg-white px-4 py-2 overflow-hidden ${isOpen ? 'max-h-20 ease-in' : 'max-h-0'}`}
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          <p className="m-0 text-left">{answer}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex justify-left items-left flex-col mt-20 ml-20 mb-5">
        <div className="text-left">
          <button
            className="hover:scale-105 transition-all duration-300 text-xs py-2 px-4 rounded mt-10 mb-7 "
            onClick={toggleReturn}
          >
            Return
          </button>
          <div className="text-xl font-poppins mb-0">Help/Frequently Asked Questions</div>
        </div>
      </div>

      <div className="container ml-20 py-8">
        <FaqItem
          question="What are Session IDs?"
          answer="Session IDs are..."
        />
        <FaqItem
          question="Can I create new sessions?"
          answer="Yes..."
        />
        <FaqItem
          question="Can I access previous sessions?"
          answer="Yes..."
        />
        <FaqItem
          question="How is data collected?"
          answer="It is collected through..."
        />
        <FaqItem
          question="What is vendibility?"
          answer="Vendibility..."
        />
        <FaqItem
          question="Which CribMaster solutions does the software calculate vendibility for?"
          answer="Vendibility is calculated for the CribMaster ProLock, ProStock, and ToolBox."
        />
      </div>
    </div>
  );
};

export default HelpPage;
