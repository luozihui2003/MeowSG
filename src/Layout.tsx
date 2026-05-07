import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './auth';

export function Layout() {
  const { user, signOut } = useAuth();
  return (
    <div className="shell">
      {user && (
        <header className="top-bar">
          <Link className="brand" to="/cats">🐾 MeowSG</Link>
          <div className="user">
            <span className="user-name">{user.displayName}</span>
            <button className="link-btn" onClick={() => void signOut()}>Sign out</button>
          </div>
        </header>
      )}
      <main className="page">
        <Outlet />
      </main>
      {user && (
        <nav className="bottom-nav">
          <NavLink to="/cats" end>🐱 Cats</NavLink>
          <NavLink to="/map">🗺️ Map</NavLink>
          <NavLink to="/cats/new">➕ Add</NavLink>
        </nav>
      )}
    </div>
  );
}
