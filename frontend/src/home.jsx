import { useState } from 'react'
import { useEffect } from 'react';
import Subject from './components/subject.jsx'
import NavBar from './components/navBar.jsx'
import Loader from './components/loader.jsx'
import "./css/home.css"
import {  useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { FaRegCalendarDays } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";


function Home() {

  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const baseUrl = import.meta.env.VITE_baseUrl;
  const user = JSON.parse(localStorage.getItem('user'));
  const [disable, setDisable] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  let countOfSubjectsCurrentlyDisplayed = 0;



  useEffect(() => {
    const fetchData = async () => {
      setDisable(true);
      try {
        if (!user) {
          navigate('/');
          return;
        }
        const res = await fetch(baseUrl + "list", {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        })
        const r = await res.json();
        if (res.status === 401) {
          navigate('/')
        }
        if (!res.ok) {
          throw new Error(r.message);
        }
        setSubjects(r.subjects);
      }
      catch (err) {
         toast.error("Something went Wrong!");
        console.log(err.message);
      }
      setDisable(false);
    };

    fetchData();
  }, []);

  const handleManualChange = async (id, which, what, date) => {
    setDisable(true);
    try {
      if (!user) {
        navigate('/');
        return;
      }
      const res = await fetch(`${baseUrl}manual/${id}/${which}/${what}/${date}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })
      const r = await res.json();
      toast.success("Success!");
      setSubjects((prev) => {
        return prev.map((subject) => {
          if (subject._id === id) {
            return r;
          }
          return subject;
        })
      })


    }
    catch (err) {
      toast.error("Something went Wrong!");
      console.log(err.message);
    }
    setDisable(false);
  }

  const handleDelete = async (id) => {

    setDisable(true);
    const askUser = window.confirm("Are you sure to delete this subject?");
    if (!askUser) {
      setDisable(false);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}delete/${id}`, {

        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },

      })
      if (!res.ok) {
        throw new Error("something went wrong");
      }
      toast.success("Deleted!");
      setSubjects((prev) => {
        return prev.filter((subject) => {
          return subject._id !== id;
        })
      })
    } catch (err) {
      toast.error("Something went Wrong!");
      console.log(err);
    }
    setDisable(false);
  }

  const handleDeleteAll = async () => {
    setDisable(true);
    const askUser = window.confirm("Are you sure to delete all subjects?");
    if (!askUser) {
      setDisable(false);
      return;
    }
    try {
      const res = await fetch(`${baseUrl}deleteAll`, {

        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },

      })
      if (!res.ok) {
        throw new Error("something went wrong");
      }
      toast.success("Deleted All Subjects!");
      setSubjects([]);
    } catch (err) {
      toast.error("Something went Wrong!");
      console.log(err);
    }
    setDisable(false);
  }

  const handleSearchBarInputChange = (e) => {
    let value = e.target.value;
    setSearchInput(value);
  }

  return (
    <>
      {disable && <Loader />}
      <div className="home">

        <NavBar />
        <ToastContainer position="bottom-center" autoClose={1000} />
        <div className='featureContainer'>

          <button className='addButton' onClick={() => {
            navigate("/add")
          }}>ADD</button>
          <button className='deleteButton' onClick={() => { if (!disable) handleDeleteAll(); }
          }>Delete All</button>
          <button className='calendarViewButton' onClick={() => {
            navigate("/calendarViewPage")
          }}>Calender View <FaRegCalendarDays /></button>

        </div>
        <div className="searchBarContainer">
          <input type='text' className='searchBarField' name='searchBarField' placeholder='Search for a subject' value={searchInput} onChange={handleSearchBarInputChange} />
          <IoSearch className='searchIcon' />

        </div>
        <div className='subjectsContainer'>
          {
            subjects.map((subject) => {
              if (subject.subjectName.toLowerCase().includes(searchInput.toLowerCase())) {
                countOfSubjectsCurrentlyDisplayed++;
                return <Subject key={subject._id} subjectId={subject._id} subjectName={subject.subjectName} attended={subject.attended} absent={subject.absent} handleManualChange={handleManualChange}
                handleDelete={handleDelete} criteria={subject.criteria} disable={disable} />
              } 
              else {
                return null;
              }
            })
          }
          {countOfSubjectsCurrentlyDisplayed === 0 && <div className="noAddedSubjectMessage">No subject found , click "add" to get started</div>}
        </div>
      </div>
    </>
  )
}

export default Home