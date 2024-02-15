import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

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
            <nav className='nav-list'>
                <button className="nav-link">Existing Session IDs</button>
                <div className="nav-link">
                <label>Enter Session ID: </label>
                <input>
                </input>
                </div>

            </nav>
        </header>
    );
};

export default Header;