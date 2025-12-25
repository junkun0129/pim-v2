import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import { ToastContainer } from "./ui/Toast";
import React, { useState, useMemo, useEffect } from "react";

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Close mobile menu when view changes
  // useEffect(() => {
  //   setIsMobileMenuOpen(false);
  // }, [activeView]);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 font-sans overflow-hidden">
      {/* <ToastContainer toasts={toasts} removeToast={removeToast} /> */}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 text-white z-30 flex items-center px-4 justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">PIM Pro</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        userRole={currentUserRole}
        availableUsers={users}
        onSwitchUser={(id) => setCurrentUserId(id)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        unreadNotificationCount={notifications.filter((n) => !n.isRead).length}
      /> */}
      <main
        className="flex-1 overflow-auto pt-16 md:pt-0 relative w-full"
        id="main-content"
      >
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {/* {title} */}
          </h1>

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
