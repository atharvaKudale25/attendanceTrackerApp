import { useState, useEffect } from 'react'
import { CgProfile } from "react-icons/cg";
import "../css/navBar.css";
import { Navigate, useNavigate } from "react-router-dom";


function NavBar() {

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        navigate("/");
        return null;
    }


    return (
        <>
            <div className="navBarContainer">
                <div className="first">
                    <CgProfile className='profileIcon' />
                    <div className="nameText">
                        Welcome , {user.name}
                    </div>
                </div>

                <div className="second">
                    <div className="emailText">
                        {user.email}
                    </div>
                    <button className='logOutButton' onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/');
                    }}> Log Out </button>
                </div>
            </div>
        </>
    )
}

export default NavBar