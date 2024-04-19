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
          className={`bg-white px-4 py-2 overflow-hidden ${isOpen ? 'max-h-full' : 'max-h-0'}`}
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

      <div className="flex text-base font-poppins justify-left mb-4 text-green">Getting Started</div>
        <FaqItem 
          question="How can I upload my spreadsheet for further data generation/vendibility analysis?"
          answer="Once you enter the program, you can click on 'Generate New Solution' in the 
          top right corner. Once this button is clicked, then you will be prompted to upload either an 
          .xlsx or .csv spreadsheet with your current data. Make sure to fill out all required fields and
          that you follow the instructions on screen. Once you are finished, click 'Import'. The system will
          read and process your uploaded document. You will then be presented with a table of your original data,
          which is ready for data generation."
        />

        <FaqItem
        question="My data is uploaded. How do I start the data generation/vendibility analysis for all my data?"
        answer="First, either press the 'Select All' button or the first checkbox of the column headers. This will
        select all the data in your table. Once your data is selected, a new button will appear in the top right
        corner, right below the Export buttons. It will say 'Calculate Vendibility for n Item(s)'. Click this
        button, and the data analysis process will begin."
        />

        <FaqItem
        question="I only want to perform a data analysis for some of my items."
        answer="To only perform a data analysis on certain items, you can either manually select the
        desired items, search for specific items, or filter for specific categories of items. Once you have selected
        the data you want analyzed, click on the 'Calculate Vendibility for n Items(s)' button in the
        top right corner to begin the data analysis process."
        />

        <FaqItem
        question="My data is finished with data analysis. How do I export all of my generated data?"
        answer="To export all of your data, simply press the 'Export All' button in the top right corner. A .xlsx
        document will automatically start downloading with your completed results."
        />

        <FaqItem
        question="I only want to export some of the generated data."
        answer="To export only some of the generated data, you first need to either manually select your
        desired items, search for specific items, or filter for specific categories of items. Once you have
        selected the data you want exported, click on the 'Export Selected' button in the top right corner. A
        .xlsx document will automatically start downloading with your selected results."
        />


      <div className="flex text-base font-poppins justify-left mb-4 text-green">Sessions</div>
        <FaqItem
          question="What are sessions?"
          answer="Sessions are what is used to store all information associated with a particular vendibility
          analysis session. All users can access different sessions to see or analyze the respective session's 
          data items."
        />
        <FaqItem
          question="Can I create new sessions?"
          answer="Yes, you are able to create a new session if you click the 'Generate New Solution' button in
          top right corner of the work dashboard."
        />
        <FaqItem
          question="Can I access previous sessions?"
          answer="Yes, you are able to access previously generated sessions. Once you first start using the software,
          you are presented with a list of the currently available sessions. By clicking on the session ID number, 
          you will access the data for the respective session. If you are already on a session and wish to access
          a different session, you should click the Session ID List in the top left corner of your work dashboard.
          This will traverse you back to the Session ID list."
        />

      <div className="flex text-base font-poppins justify-left mb-4 text-green">Data Collection / Generation</div>
        <FaqItem
          question="How is data collected?"
          answer="It is collected through a combination of web-scraping and AI generation. The software will parse
          your uploaded data into our data generation algorithms, which will search the web for the necessary
          information needed about your item.
          "
        />
        <FaqItem
        question="I want to edit some of the data collected."
        answer="To edit a data field in an item, first click on that item's description. This will take you
        to a page that has all the item's details expanded. Click on the 'Edit Details' button, which will provide
        you with a menu where you are able to select the fields you wish to edit. Make your desired changes and click
        'Update' when you are finished."
        />
      
      <div className="flex text-base font-poppins justify-left mb-4 text-green">Vendibility</div>
        <FaqItem
          question="What is vendibility?"
          answer="Vendibility can be described as whether an item can fit and be placed in a hardware solution. 
          It can also refer to the capacity of the item that can be fit."
        />
        <FaqItem
          question="Which solutions does the software calculate vendibility for?"
          answer="Vendibility is calculated for the ProLock, ProStock, and ToolBox."
        />
        <FaqItem
          question="What types of storage  solutions does the software calculate vendibility for?" 
          answer="It calculates vendibility options for locker-based, coil-based, and carousel-based storage solutions.
            However, the methods of calculations feature specific measurements from CribMaster's ToolBox, ProLock,
            and Toolbox. To use this software to calculate vendibility to machines of different measurements
            can potentially yield inaccurate results."
        />
      </div>
    </div>
  );
};

export default HelpPage;
