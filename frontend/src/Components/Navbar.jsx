import '../Style/Navbar.css';
import { Link } from 'react-router-dom';
export const Navbar = ({ account, onLogout }) => {
    return(
        <>
        <div className="navbar">
            <div className="logo">Ecolytics</div>
            <div className="nav-links">
                <Link to ="/">Home</Link>
                <Link to="/remnant-entry">Add Entry</Link>
                <Link to="/donate">Donate</Link>
                <Link to="/profile">Profile</Link>
                <span className="nav-account-name">{account.fullName}</span>
                <button type="button" onClick={onLogout} className="logout nav-logout">Log out</button>
            </div>
        </div>
        </>
    )
}
