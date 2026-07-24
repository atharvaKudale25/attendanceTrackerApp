import { useState } from 'react'
import './css/signin.css'
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import Loader from './components/loader.jsx'

function Signin() {
    const [submitting, setSubmitting] = useState(false);
    const [userData, setUserData] = useState({
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState('');
    const baseUrl = import.meta.env.VITE_baseUrl;
    const user = JSON.parse(localStorage.getItem('user'));

    const navigate = useNavigate();

    useEffect(() => {
        const authorize = async () => {
            try {
                const res = await fetch(`${baseUrl}verify`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                    },

                })
                const r = await res.json();
                if (res.ok) {
                    navigate('/home');
                }

            } catch (err) {

            }
            setSubmitting(false);
        }
        if (user) {
            setSubmitting(true);
            authorize();
        }
    }, [])


    const handleChange = (e) => {
        setUserData((userData) => {
            return {
                ...userData,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userData.email.trim(),
                    password: userData.password,
                }),
            });
            const res = await response.json();


            if (!response.ok) {
                throw new Error(res.message);
            }

            localStorage.setItem('user', JSON.stringify(res));
            navigate('/home');
        }
        catch (err) {
            setErrorMessage(err.message);
        }
        setSubmitting(false);

    }

    return (

        <>
            {submitting && <Loader />}
            <div className="signInBody">
                <form onSubmit={handleSubmit} className='signInContainer'>
                    <div className='signInHeader'>Sign In</div>
                    <div className='emailDiv'>Email:

                        <input type="email" className='emailField' required name="email" value={userData.email} onChange={handleChange} />
                    </div>
                    <div className='passwordDiv'>Password:


                        <input type="password" name="password" required className='passwordField' value={userData.password} onChange={handleChange} />
                    </div>

                    <div className='errorDiv'>{errorMessage}</div>
                    <button type='submit' className='button' disabled={submitting}>{submitting ? "loading.." : "Sign In"}</button>
                    <div className="infoDiv">
                        New here ?  <div className='signUp' onClick={() => {
                            navigate("/signup")
                        }}>  Sign up</div>
                    </div>
                </form>
            </div>

        </>
    )
}

export default Signin;