import { Link } from "react-router-dom";
import "../css/notFound.css";

function NotFound() {
    return (
        <div className="notFoundContainer">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>
                Sorry, the page you are looking for
                doesn't exist or has been moved.
            </p>
            <Link to="/home">Return Home</Link>
        </div>
    );
}

export default NotFound;