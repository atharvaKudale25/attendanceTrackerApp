import { useState } from 'react'
import NavBar from './components/navBar.jsx'
import "./css/calendarViewPage.css"
import { useNavigate } from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { IoReturnUpBackOutline } from "react-icons/io5";
import { formatDateInYYYY_MM_DD } from './utils/helpersFunction.jsx';


function CalendarViewPage() {

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [dateInput, setDateInput] = useState(formatDateInYYYY_MM_DD(new Date()))
    const [validDate, setValidDate] = useState(true)

    const navigate = useNavigate();

    const handleChangeInTabularCalendar = (date) => {
        setSelectedDate(date);
        setDateInput(formatDateInYYYY_MM_DD(date));
        setValidDate(true);
    }

    const handleChangeInDateInput = (e) => {
        const value = e.target.value;

        setDateInput(value);

        if (!value) {
            setValidDate(false);
            return;
        }

        const [year, month, day] = value.split("-").map(Number);
        const newDate = new Date(year, month - 1, day);

        setSelectedDate(newDate);
        setValidDate(true);
    }

    const handleSubmit = () => {
        const date = formatDateInYYYY_MM_DD(selectedDate);
        navigate(`/activity/${date}`);
    }

    return (
        <div className='CalendarViewPageContainer'>
            <NavBar />
            <div className="returnToHome" onClick={() => navigate('/home')}>
                <IoReturnUpBackOutline />Return To Home
            </div>
            <input type="date" className="calendarDateInput" value={dateInput} onChange={handleChangeInDateInput} />
            <Calendar value={selectedDate} onChange={handleChangeInTabularCalendar} />
            <div className='buttonsForCalendarViewInput'>
                <button className="cancelButtonForCalendarInput" onClick={() => navigate(-1)}>
                    Cancel
                </button>
                <button className="submitForCalendarInput" disabled={!validDate} onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    );
}

export default CalendarViewPage;

