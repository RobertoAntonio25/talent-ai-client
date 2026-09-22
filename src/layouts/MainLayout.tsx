import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <nav className="bg-slate-800 p-4 border-b border-slate-700 flex gap-4 justify-center">
        <Link to="/register" className="hover:text-blue-400 transition-colors">
          Register
        </Link>
        <Link to="/login" className="hover:text-blue-400 transition-colors">
          Login
        </Link>
        <Link to="/dashboard" className="hover:text-blue-400 transition-colors">
          Dashboard
        </Link>
        <Link to="/settings" className="hover:text-blue-400 transition-colors">
          Settings
        </Link>
      </nav>

      <main className="flex-1 p-8 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
