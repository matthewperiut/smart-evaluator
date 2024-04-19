import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import Logo from "/src/assets/Logo_White.png"


const Header = () => {
    const navigate = useNavigate();

    //  useEffect allows you to perform side effects in function components in a declarative and controlled way, 
    //  ensuring that they happen at the right time during the component lifecycle. 
    //  In this case, it ensures that the navigation action occurs after the initial render and any updates to the navigate function.
    useEffect(() => {
        return () => { // Cleanup tasks can go in this function.
        };
    }, [navigate]);

    return (
        <header className='top-bar'>
            <img src={Logo} className="logo"></img>
            <nav className='nav-list'>
                
            </nav>
        </header>
    );
};

export default Header;