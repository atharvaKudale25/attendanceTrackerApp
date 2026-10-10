import { useEffect, useState } from 'react'
import NavBar from './components/navBar.jsx'
import "./css/activityPage.css"
import { useNavigate, useParams } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { FaRegCalendarDays } from "react-icons/fa6";
import ActivitySubject from './components/activitySubject.jsx';
import Loader from './components/loader.jsx'

function ActivityPage() {

    const [subjectsData, setSubjectsData] = useState([]);
    const [submitting, setSubmitting] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const baseUrl = import.meta.env.VITE_baseUrl;
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const { requiredDate } = useParams();

    useEffect(() => {
        if (!user?.token) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            setSubmitting(true);
            setErrorMessage("");

            try {
                const res = await fetch(`${baseUrl}activity/${requiredDate}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                    },
                });

                const r = await res.json();

                if (res.status === 401) {
                    localStorage.removeItem("user");
                    navigate('/');
                    return;
                }

                if (!res.ok) {
                    throw new Error(r.message || "Failed to fetch activity.");
                }

                setSubjectsData(r.subjects);
            } catch (err) {
                setSubjectsData([]);
                setErrorMessage(err.message || "Something went wrong.");
            } finally {
                setSubmitting(false);
            }
        };

        fetchData();
    }, [baseUrl, navigate, requiredDate, user?.token]);

    const formatDate = (date) => {
        if (!date) return "";

        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    let errorContent = null;
    let activityContent = null;

    if (errorMessage) {
        errorContent = <div className="activityErrorMessage">{errorMessage}</div>;
    }

    if (submitting) {
        activityContent = <Loader/>;
    } else if (subjectsData.length > 0) {
        activityContent = (
            <div className="ActivitySubjectsContainer">
                {subjectsData.map(subject => <ActivitySubject key={subject._id} subjectId={subject._id} subjectName={subject.subject} attendedCount={subject.attendedCount} absentCount={subject.absentCount} />)}
            </div>
        );
    } else if (!errorMessage) {
        activityContent = <div className="activityStatusMessage">No attendance changes recorded for this day.</div>;
    }

    return (
        <div className="activityPageMainContainer">
            <NavBar />

            <div className="retHomeAndCalendarButton">
                <div className="ActivityPageReturnToHome" onClick={() => navigate('/home')}>
                    <IoReturnUpBackOutline />
                    Return To Home
                </div>

                <button className="activityCalendarViewButton" onClick={() => navigate("/calendarViewPage")}>
                    Calendar View <FaRegCalendarDays />
                </button>
            </div>

            <div className="date">{formatDate(requiredDate)}</div>

            {errorContent}
            {activityContent}
        </div>
    );
}

export default ActivityPage;