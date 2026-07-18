import { useState, useEffect } from 'react'
import './css/add.css'
import { Navigate, useNavigate } from "react-router-dom";


function Add() {
    const [submitting, setSubmitting] = useState(false);
    const [userData, setUserData] = useState({
        subjectName: "",
        attended: 0,
        absent: 0,
        criteria: 75
    });
    const [errorMessage, setErrorMessage] = useState('');
    const baseUrl = import.meta.env.VITE_baseUrl;
    const user = JSON.parse(localStorage.getItem('user'));

    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }

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
                if (res.status === 401) {
                    localStorage.removeItem("user");
                    navigate('/');
                }
                if (!res.ok) {
                    throw new Error(r.message);

                }

            } catch (err) {
                setErrorMessage(err.message);
                console.log(err.message);
            }
        }
        authorize();


    }, [])

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name !== "subjectName" && value !== "") {
            value = Number(value);

            if (name === "criteria") {
                value = Math.min(Math.max(value, 0), 100);
            } else {
                value = Math.min(Math.max(value, 0), 999);
            }

            value = Math.round(value);
        }

        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!user) {
                navigate('/');
                return;
            }
            const res = await fetch(`${baseUrl}add`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            })
            const r = await res.json();
            console.log(res.status);
            if (res.status == 401) {
                localStorage.removeItem("user");
                navigate('/');
            }
            if (!res.ok) {
                throw new Error(r.message);

            }
            navigate("/home");
        }
        catch (err) {
            console.log(err.message);
            setErrorMessage(err.message);
        }
        setSubmitting(false);
    }

    return (

        <>
            <div className="addBody">
                <form onSubmit={handleSubmit} className='addContainer'>
                    <div className='addHeader'>Add a Subject</div>

                    <div className='addSubjectNameDiv'>
                        Name:
                        <input
                            type="text"
                            className="subjectNameField"
                            name="subjectName"
                            value={userData.subjectName}
                            onChange={handleChange}
                            required
                            minLength={1}
                            maxLength={50}
                            autoComplete="off"
                        />
                    </div>

                    <div className='addAttendedDiv'>
                        Attended:
                        <input
                            type="number"
                            className="attendedField"
                            name="attended"
                            value={userData.attended}
                            onChange={handleChange}
                            required
                            min={0}
                            max={999}
                            step={1}
                        />
                    </div>

                    <div className='addAbsentDiv'>
                        Absent:
                        <input
                            type="number"
                            className="absentField"
                            name="absent"
                            value={userData.absent}
                            onChange={handleChange}
                            required
                            min={0}
                            max={999}
                            step={1}
                        />
                    </div>

                    <div className='addCriteriaDiv'>
                        Attendance Criteria (%):
                        <input
                            type="number"
                            className="criteriaField"
                            name="criteria"
                            value={userData.criteria}
                            onChange={handleChange}
                            required
                            min={0}
                            max={100}
                            step={1}
                        />
                    </div>

                    <div className='errorDiv'>{errorMessage}</div>
                    <div className="addButtons">
                        <button className='cancelButton' disabled={submitting} onClick={() => {
                            navigate("/home");
                        }
                        }>Cancel</button>
                        <button type='submit' className='submitButton' disabled={submitting}>{submitting ? "Loading.." : "Submit"}</button>
                    </div>
                </form>
            </div>

        </>
    )
}

export default Add;