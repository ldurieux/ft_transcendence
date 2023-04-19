import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="nav">
        <ul>
            <li><Link to="/authentication">Login</Link></li>
            <li><Link to="/profile">Profile</Link></li>
        </ul>
    </nav>
  );
};

export default Header;