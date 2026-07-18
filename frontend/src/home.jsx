import { useState } from 'react'
import Subject from './components/subject.jsx'
import NavBar from './components/navBar.jsx'
import "./css/home.css"
import { useEffect } from 'react';
import { Navigate, useNavigate } from "react-router-dom";


function Home() {

  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const baseUrl = import.meta.env.VITE_baseUrl;
  const user = JSON.parse(localStorage.getItem('user'));



  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          navigate('/');
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
        console.log(err.message);
      }
    };

    fetchData();
  }, []);

  const handleManualChange = async (id, which, what) => {
    try {
      if (!user) {
        navigate('/');
      }
      const res = await fetch(`${baseUrl}manual/${id}/${which}/${what}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })
      const r = await res.json();
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
      console.log(err.message);
    }
  }

  const handleDelete = async (id) => {
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
      setSubjects((prev) => {
        return prev.filter((subject) => {
          return subject._id !== id;
        })
      })
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteAll = async()=>{
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
      setSubjects([]);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <div className="home">
        <NavBar />
        <div className='featureContainer'>

          <button className='addButton' onClick={() => {
            navigate("/add")
          }}>ADD</button>
          <button className='deleteButton' onClick={() => { handleDeleteAll(); }
          }>Delete All</button>
        </div>
        <div className='subjectsContainer'>{
          subjects.map((subject) => {
            return <Subject key={subject._id} subjectId={subject._id} subjectName={subject.subjectName} attended={subject.attended} absent={subject.absent} handleManualChange={handleManualChange}
              handleDelete={handleDelete} criteria = {subject.criteria}/>
          })
        }
        </div>
      </div>
    </>
  )
}

export default Home