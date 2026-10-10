# Attendance Tracker

A full-stack MERN application that helps students manage attendance across multiple subjects, track daily attendance activity, and calculate how many classes they need to attend or can safely skip to maintain their required attendance percentage.

**Live Demo:** https://attendance-tracker-app-jade.vercel.app/

**Repository:** https://github.com/atharvaKudale25/attendanceTrackerApp

---

## Features

### Authentication
- User registration and login
- Password hashing using **bcrypt**
- JWT-based authentication
- Protected backend routes using authentication middleware
- User-specific subject and activity data

### Attendance Management
- Add, edit, and delete subjects
- Delete all subjects at once
- Track attended and absent classes
- Set individual attendance criteria for each subject
- Automatically calculate attendance percentages
- Validate attendance values and form inputs

### Attendance Recommendations
- Calculate the minimum number of classes required to reach the target attendance when below the required percentage
- Calculate how many consecutive classes can be skipped while maintaining the required percentage
- Automatically update recommendations when attendance changes
- Handle attendance calculations using each subject's individual attendance criteria

### Calendar & Attendance Activity
- View attendance activity using a calendar
- Select a specific date to view recorded attendance activity
- Track attended and absent class increments for individual subjects on a particular day
- Record multiple attendance changes for the same subject on the same date
- Retrieve date-specific activity through the backend API
- View daily activity separately from overall subject attendance totals

### User Experience
- Responsive interface for desktop, tablet, and mobile
- Client-side navigation using React Router
- Dedicated Not Found (404) page for unavailable frontend routes
- Loading indicators during API requests
- Disabled buttons while requests are processing
- Immediate UI updates after operations
- Success and error notifications
- Input validation and user-friendly error handling

### Security & Reliability
- Password hashing using bcrypt
- JWT-based authentication and authorization
- Protected backend endpoints
- Environment variables for sensitive configuration
- MongoDB Atlas connection
- CORS configuration
- Backend validation of incoming data
- Error handling for invalid requests and database operations

---

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- CSS3
- Fetch API
- React Calendar
- React Toastify

### Backend
- Node.js
- Express.js
- REST APIs
- Modular route organization

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JSON Web Tokens (JWT)
- bcrypt

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## Screenshots

### Login

<p align="center">
  <img src="./screenshots/login.png" width="850" alt="Login page">
</p>

### Dashboard

<p align="center">
  <img src="./screenshots/dashboard.png" width="850" alt="Attendance dashboard">
</p>

### Add Subject

<p align="center">
  <img src="./screenshots/add-subject.png" width="850" alt="Add subject page">
</p>

### Mobile View

<p align="center">
  <img src="./screenshots/mobile-view.jpeg" width="300" alt="Mobile view">
</p>

---

## Installation & Setup

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- Git
- A MongoDB Atlas account or a compatible MongoDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/atharvaKudale25/attendanceTrackerApp.git
cd attendanceTrackerApp
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Replace the placeholder values with your actual configuration.

Start the backend using your configured start script. For a development setup using Nodemon and Node's environment-file option, run:

```bash
npx nodemon --exec "node --env-file=.env" app.js
```

### 3. Frontend Setup

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_baseUrl=http://localhost:3000/
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

**Note:** Never commit actual credentials or secret keys to GitHub. Keep `.env` files private and configure production environment variables separately on Render and Vercel.

---

## API Overview

The backend exposes REST endpoints for authentication, subject management, and attendance activity.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/` | Authenticate a user and log in |

### Subject Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/list` | Retrieve the user's subjects |
| POST | `/add` | Add a subject |
| PUT | `/edit/:id` | Update a subject |
| DELETE | `/delete/:id` | Delete a subject |
| DELETE | `/deleteAll` | Delete all subjects |

### Attendance Activity

| Method | Endpoint | Description |
|---|---|---|
| GET | `/activity/:requiredDate` | Retrieve attendance activity for the specified date |

The `requiredDate` parameter specifies the date for which activity is requested. For example:

```http
GET /activity/2026-10-09
```

This requests the recorded attendance activity for October 9, 2026. Protected endpoints require the appropriate authentication token.

---

## Attendance Calculation

The application uses the following formulas to calculate current attendance and recommend future classes. In these formulas:

- `A` = number of classes attended
- `B` = number of classes absent
- `P` = target attendance percentage (for example, use `75` for a target of 75%)
- `x` = number of additional classes attended or skipped, depending on the calculation

### 1. Attendance Percentage

The current attendance percentage is calculated as:

**Attendance Percentage = (A / (A + B)) × 100**

**Example:** If a student attended 36 classes and missed 14 classes:

**Attendance Percentage = (36 / (36 + 14)) × 100 = 72%**

The student's current attendance is **72%**. If no classes have taken place (`A + B = 0`), attendance is undefined until at least one class is recorded.

### 2. Classes Required to Attend

When attendance is below the target percentage, the application calculates the minimum number of consecutive classes the student must attend without missing any.

Let `x` be the number of additional classes attended. The required condition is:

> **((A + x) / (A + B + x)) × 100 ≥ P**

Rearranging gives:

> **100(A + x) ≥ P(A + B + x)**

> **(100 − P)x ≥ P(A + B) − 100A**

Therefore, for a target percentage `P` where `0 ≤ P < 100`, the minimum number of additional classes to attend is:

> **x = max(0, ⌈(P(A + B) − 100A) / (100 − P)⌉)**

Here, `⌈value⌉` is the ceiling function, which rounds up to the next integer. This ensures the student attends enough whole classes to meet the target.

**Example:**

- Classes attended: 34
- Classes absent: 16
- Current attendance: 68%
- Target attendance: 75%

Substituting the values:

> **x = ⌈(75(34 + 16) − 100(34)) / (100 − 75)⌉**

> **x = ⌈(3750 − 3400) / 25⌉ = ⌈14⌉ = 14**

The student must attend the next **14 consecutive classes** to reach 75% attendance.

### 3. Classes That Can Be Skipped

When attendance is above the target percentage, the application calculates how many consecutive upcoming classes the student can skip without falling below the target.

Let `x` be the number of additional classes skipped. The required condition is:

> **(A / (A + B + x)) × 100 ≥ P**

Rearranging gives:

> **100A ≥ P(A + B + x)**

> **100A − P(A + B) ≥ Px**

Therefore, for a target percentage `P > 0`, the maximum number of classes that can be skipped is:

> **x = max(0, ⌊(100A − P(A + B)) / P⌋)**

Here, `⌊value⌋` is the floor function, which rounds down to the nearest integer. This ensures the recommendation does not violate the target attendance percentage.

**Example:**

- Classes attended: 43
- Classes absent: 7
- Current attendance: 86%
- Target attendance: 75%

Substituting the values:

> **x = ⌊(100(43) − 75(43 + 7)) / 75⌋**

> **x = ⌊(4300 − 3750) / 75⌋ = ⌊550 / 75⌋ = 7**

The student can skip the next **7 consecutive classes** while maintaining at least 75% attendance.

### Important Edge Cases

- **No classes recorded:** Attendance is undefined until at least one class is recorded.
- **Target attendance of 100%:** If classes have already been missed, no finite number of additional attended classes can restore attendance to exactly 100%. If no classes have been missed, the target is already met.
- **Target attendance of 0%:** The attendance criterion places no upper limit on the number of classes that can be skipped.
- **Already meeting the target:** Zero additional classes are required to reach the target.
- **Integer rounding:** The ceiling function (`⌈ ⌉`) is used for classes to attend, while the floor function (`⌊ ⌋`) is used for classes that can be skipped.
- **Target already exceeded:** The skip recommendation is calculated using the current attended and absent totals and the selected target percentage.

---

## Calendar-Based Attendance Activity

The calendar feature allows users to view recorded attendance activity for a particular date.

For example, a student may record the following activity for a subject on a given day:

| Activity | Classes |
|---|---:|
| Attended classes added | +3 |
| Absent classes added | +1 |

These entries represent attendance changes recorded for that date. The activity endpoint is:

```http
GET /activity/:requiredDate
```

For example:

```http
GET /activity/2026-10-09
```

This allows the frontend to request activity for the selected date, separately from the cumulative attendance totals maintained for each subject.

---

## Error Handling

The application includes validation and error handling for scenarios such as:

- Duplicate email registration
- Duplicate subject names
- Invalid login credentials
- Missing or invalid authentication tokens
- Unauthorized API requests
- Invalid MongoDB ObjectIds
- Empty or invalid form fields
- Invalid attendance values
- Invalid attendance criteria
- Network failures
- Server errors
- Unavailable frontend routes

---

## What I Learned

Through this project, I gained practical experience with:

- Full-stack MERN development
- Designing and organizing REST APIs
- React components, hooks, and state management
- Client-side routing and 404 handling
- JWT authentication and authorization middleware
- Password hashing using bcrypt
- MongoDB, Mongoose, and schema design
- CRUD operations
- Date-wise attendance activity tracking
- Calendar integration and date handling
- Mathematical attendance calculations and edge cases
- Frontend and backend validation
- Environment variables and CORS configuration
- Deployment using Vercel, Render, and MongoDB Atlas
- Responsive UI development
- Debugging API integration and deployment issues

---

## Future Improvements

- Forgot password functionality
- Email verification
- Attendance analytics and visualizations
- Import/export attendance data
- Dark mode
- Additional attendance reports

---

## Author

**Atharva Kudale**

If you find this project useful, feel free to ⭐ the repository.
