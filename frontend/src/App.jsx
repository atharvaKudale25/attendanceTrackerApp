import { Route, Routes } from 'react-router-dom'
import Signup from './signup.jsx'
import Signin from './signin.jsx'
import Home from './home.jsx'
import Add from './add.jsx'
import Edit from './edit.jsx'
import CalendarViewPage from './calenderViewPage.jsx'
import ActivityPage from './activityPage.jsx'
import NotFound from "./components/notFound.jsx";

function App() {


  return (
    <>
      <Routes>
        <Route path='/' element={<Signin />} />
        <Route path='/home' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/add' element={<Add />} />
        <Route path='/edit/:id' element={<Edit />} />
        <Route path='/activity/:requiredDate' element={<ActivityPage />} />
        <Route path='/calendarViewPage' element={<CalendarViewPage />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  )
}

export default App
