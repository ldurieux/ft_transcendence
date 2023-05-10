import {startTransition} from "react";

const Header = () => {
  return (
      <div className="wrapper">
        <nav className="nav">
            <h2>Menu</h2>
            <ul>
                <li><button onClick={() => startTransition(() => {
                    window.location.href = "/login";})}>
                        Login
                </button></li>
                <li><button onClick={() => startTransition(() => {
                    window.location.href = "/profile";})}>
                        Profile
                </button></li>
                <li><button onClick={() => startTransition(() => {
                    window.location.href = "/game";})}>
                        Game
                </button></li>
                <li><button onClick={() => startTransition(() => {
                    window.location.href = "/leaderboard";})}>
                        Leaderboard
                </button></li>
                <li><button onClick={() => startTransition(() => {
                    window.location.href = "/chat";})}>
                        Chat
                </button></li>
            </ul>
        </nav>
      </div>
  );
};

export default Header;