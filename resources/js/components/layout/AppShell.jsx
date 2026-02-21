import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNavItems = [
    {
        to: '/admin/dashboard',
        label: 'الرئيسية',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        to: '/admin/students',
        label: 'الطلاب',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        to: '/admin/courses',
        label: 'الكورسات',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
];

const studentNavItems = [
    {
        to: '/student/courses',
        label: 'كورساتي',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
];

export default function AppShell() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar (fixed, RIGHT) ── */}
            <aside className={`
                fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-100 shadow-sm
                z-30 flex flex-col transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
                    <span className="text-xl font-bold text-indigo-600">ITeacher</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                transition-colors
                                ${isActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom: user info + logout only */}
                <div className="shrink-0 p-3 border-t border-gray-100">
                    <div className="flex items-center justify-between px-1">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400">
                                {user?.role === 'admin' ? 'مدير' : 'طالب'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 mr-2"
                        >
                            خروج
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main content area ── */}
            <div className="lg:mr-64 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
                    {/* Hamburger (mobile only) */}
                    <button
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="فتح القائمة"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Brand (mobile only) */}
                    <span className="font-bold text-indigo-600 text-lg lg:hidden">ITeacher</span>

                    {/* Desktop: user info */}
                    <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                        <span>{user?.name}</span>
                        <span className="text-gray-300">·</span>
                        <span>{user?.role === 'admin' ? 'مدير' : 'طالب'}</span>
                    </div>

                    {/* Spacer for mobile */}
                    <div className="lg:hidden w-10" />
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 max-w-6xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
