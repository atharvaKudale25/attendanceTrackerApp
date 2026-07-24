import { useState } from 'react'
import './css/signup.css'
import { Navigate, useNavigate } from "react-router-dom";
import Loader from './components/loader.jsx'

function Signup() {
    const [submitting, setSubmitting] = useState(false);
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState('');
    const baseUrl = import.meta.env.VITE_baseUrl;
    const navigate = useNavigate();

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
        setErrorMessage("");

        try {
            const response = await fetch(`${baseUrl}signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email.trim(),
                    password: userData.password,
                }),
            });

            if (!response.ok) {
                const message = await response.json();
                throw new Error(message.message);
            }

            navigate("/");
        } catch (err) {
            setErrorMessage(err.message);
        }
        setSubmitting(false);

    };

    return (
        <>
            {submitting && <Loader />}
            <div className="signUpBody">
                <form onSubmit={handleSubmit} className='signUpContainer'>
                    <div className='signUpHeader'>Sign Up</div>
                    <div className='nameDiv'>User Name:

                        <input type="name" className='nameField' required name="name" value={userData.name} onChange={handleChange} />
                    </div>
                    <div className='emailDiv'>Email:

                        <input type="email" className='emailField' required name="email" value={userData.email} onChange={handleChange} />
                    </div>
                    <div className='passwordDiv'>Password:


                        <input type="password" name="password" required className='passwordField' value={userData.password} onChange={handleChange} />
                    </div>

                    <div className='errorDiv'>{errorMessage}</div>
                    <button type='submit' className='button' disabled={submitting}>{submitting ? "loading.." : "Sign Up"}</button>
                    <div className="infoDiv">
                        Already have account ?  <div className='signUp' onClick={() => {
                            navigate("/")
                        }}>  Sign In</div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Signup;