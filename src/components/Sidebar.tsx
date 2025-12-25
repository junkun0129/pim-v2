import React, { useState, useRef, useEffect } from "react";
import type {
  ViewType,
  User,
  Role,
  Permission,
  ExtensionType,
} from "../src/types";
import { ICONS } from "../src/constants";

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  currentUser: User | null;
  userRole: Role | null;
  availableUsers: User[];
  onSwitchUser: (userId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  unreadNotificationCount: number; // New Prop
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  view: ViewType;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  badgeCount?: number; // New Prop
}> = ({ icon, label, isActive, isCollapsed, onClick, badgeCount }) => (
  <button
    onClick={onClick}
    className={`group flex items-center ${
      isCollapsed ? "justify-center px-2" : "px-3"
    } py-2.5 mx-auto text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative overflow-hidden w-full ${
      isActive
        ? "bg-zinc-800 text-white shadow-md"
        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
    }`}
    title={isCollapsed ? label : undefined}
  >
    {isActive && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-lg shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
    )}
    <div className="relative">
      <span
        className={`transition-transform duration-200 block ${
          isActive ? "scale-110 text-primary-400" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </span>
      {badgeCount && badgeCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 shadow-sm ring-1 ring-zinc-900">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      ) : null}
    </div>
    {!isCollapsed && (
      <div className="flex-1 flex justify-between items-center ml-3 overflow-hidden">
        <span
          className={`transition-transform duration-200 ${
            isActive ? "translate-x-1" : ""
          } whitespace-nowrap`}
        >
          {label}
        </span>
        {badgeCount && badgeCount > 0 ? (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </div>
    )}
  </button>
);

export default function Sidebar({
  activeView,
  setActiveView,
  currentUser,
  userRole,
  availableUsers,
  onSwitchUser,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  unreadNotificationCount,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Scroll state
  const navRef = useRef<HTMLElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = navRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [activeView]);

  // Check Permissions
  const hasPermission = (perm: Permission) => {
    return userRole?.permissions.includes(perm) || false;
  };

  // Check Extensions
  const hasExtension = (ext: ExtensionType) => {
    return currentUser?.activeExtensions.includes(ext) || false;
  };

  const navItems: {
    view: ViewType;
    label: string;
    icon: React.ReactNode;
    requiredPerm: Permission;
  }[] = [
    {
      view: "SKUs",
      label: "SKU管理",
      icon: ICONS.dashboard,
      requiredPerm: "MASTER_VIEW",
    },
    {
      view: "Series",
      label: "シリーズ",
      icon: ICONS.series,
      requiredPerm: "MASTER_VIEW",
    },
    {
      view: "Categories",
      label: "カテゴリ",
      icon: ICONS.category,
      requiredPerm: "MASTER_VIEW",
    },
    {
      view: "Attributes",
      label: "属性",
      icon: ICONS.list,
      requiredPerm: "MASTER_VIEW",
    },
    {
      view: "Attribute Sets",
      label: "属性セット",
      icon: ICONS.attributes,
      requiredPerm: "MASTER_VIEW",
    },
  ];

  // Extensions / Operations (Mapped to ExtensionType)
  const omsNavItems: {
    view: ViewType;
    label: string;
    icon: React.ReactNode;
    requiredPerm: Permission;
    requiredExt: ExtensionType;
  }[] = [
    {
      view: "CHANNEL_EXPORT",
      label: "チャネル連携",
      icon: ICONS.exportCloud,
      requiredPerm: "MASTER_EXPORT",
      requiredExt: "EXPORT",
    },
    {
      view: "Orders",
      label: "在庫・発注",
      icon: ICONS.truck,
      requiredPerm: "OMS_VIEW",
      requiredExt: "OMS",
    },
    {
      view: "EC",
      label: "ECストア",
      icon: ICONS.globe,
      requiredPerm: "EC_VIEW",
      requiredExt: "EC",
    },
    {
      view: "CREATIVE",
      label: "POP作成",
      icon: ICONS.palette,
      requiredPerm: "CREATIVE_VIEW",
      requiredExt: "CREATIVE",
    },
    {
      view: "CATALOG",
      label: "Webカタログ",
      icon: ICONS.book,
      requiredPerm: "CATALOG_VIEW",
      requiredExt: "CATALOG",
    },
    {
      view: "PROJECTS",
      label: "企画プロジェクト",
      icon: ICONS.users,
      requiredPerm: "PROJECT_VIEW",
      requiredExt: "PROJECT",
    },
  ];

  const adminNavItem = {
    view: "ADMIN" as ViewType,
    label: "システム管理",
    icon: ICONS.settings,
    requiredPerm: "ADMIN_VIEW" as Permission,
  };
  const storeNavItem = {
    view: "EXTENSION_STORE" as ViewType,
    label: "拡張機能ストア",
    icon: ICONS.store,
  };
  const notifNavItem = {
    view: "NOTIFICATIONS" as ViewType,
    label: "通知",
    icon: ICONS.bell,
  };

  const filteredNavItems = navItems.filter((item) =>
    hasPermission(item.requiredPerm)
  );
  const filteredOmsItems = omsNavItems.filter(
    (item) => hasPermission(item.requiredPerm) && hasExtension(item.requiredExt)
  );
  const showAdmin = hasPermission("ADMIN_VIEW");

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
                flex flex-col bg-zinc-900 border-r border-zinc-800 shadow-2xl transition-all duration-300 z-40 shrink-0 h-screen
                fixed inset-y-0 left-0
                md:relative md:translate-x-0
                ${isCollapsed ? "md:w-20" : "md:w-64"}
                w-64
                ${isOpenMobile ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div
          className={`flex items-center gap-3 h-20 border-b border-zinc-800/50 ${
            isCollapsed ? "justify-center px-0" : "px-6"
          } shrink-0`}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 shrink-0">
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
          {/* Show title on mobile even if collapsed state is true (since mobile doesn't have collapse toggle usually) or check !isCollapsed */}
          {(!isCollapsed || isOpenMobile) && (
            <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] whitespace-nowrap overflow-hidden">
              PIM <span className="text-primary-400 font-light">Pro</span>
            </h1>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
          <div
            className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-zinc-900 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              canScrollUp ? "opacity-100" : "opacity-0"
            }`}
          />

          <nav
            ref={navRef}
            onScroll={checkScroll}
            className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden scroll-smooth"
          >
            {filteredNavItems.length > 0 && (
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                    Master Data
                  </div>
                )}
                {filteredNavItems.map((item) => (
                  <NavItem
                    key={item.view}
                    icon={item.icon}
                    label={item.label}
                    view={item.view}
                    isActive={activeView === item.view}
                    isCollapsed={isCollapsed && !isOpenMobile}
                    onClick={() => {
                      setActiveView(item.view);
                      onCloseMobile();
                    }}
                  />
                ))}
              </div>
            )}

            {filteredOmsItems.length > 0 && (
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                    Extensions
                  </div>
                )}
                {filteredOmsItems.map((item) => (
                  <NavItem
                    key={item.view}
                    icon={item.icon}
                    label={item.label}
                    view={item.view}
                    isActive={activeView === item.view}
                    isCollapsed={isCollapsed && !isOpenMobile}
                    onClick={() => {
                      setActiveView(item.view);
                      onCloseMobile();
                    }}
                  />
                ))}
              </div>
            )}

            <div>
              {!isCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                  System
                </div>
              )}
              <NavItem
                icon={notifNavItem.icon}
                label={notifNavItem.label}
                view={notifNavItem.view}
                isActive={activeView === "NOTIFICATIONS"}
                isCollapsed={isCollapsed && !isOpenMobile}
                onClick={() => {
                  setActiveView("NOTIFICATIONS");
                  onCloseMobile();
                }}
                badgeCount={unreadNotificationCount}
              />
              <NavItem
                icon={storeNavItem.icon}
                label={storeNavItem.label}
                view={storeNavItem.view}
                isActive={activeView === "EXTENSION_STORE"}
                isCollapsed={isCollapsed && !isOpenMobile}
                onClick={() => {
                  setActiveView("EXTENSION_STORE");
                  onCloseMobile();
                }}
              />
              {showAdmin && (
                <NavItem
                  icon={adminNavItem.icon}
                  label={adminNavItem.label}
                  view={adminNavItem.view}
                  isActive={activeView === "ADMIN"}
                  isCollapsed={isCollapsed && !isOpenMobile}
                  onClick={() => {
                    setActiveView("ADMIN");
                    onCloseMobile();
                  }}
                />
              )}
            </div>

            <div className="h-6"></div>
          </nav>

          <div
            className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 flex items-end justify-center pb-1 ${
              canScrollDown ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="animate-bounce bg-zinc-800 rounded-full p-1 shadow-lg border border-zinc-700">
              <svg
                className="w-3 h-3 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* User Switcher / Profile */}
        <div className="p-4 border-t border-zinc-800 z-20 bg-zinc-900 relative">
          {currentUser && (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-3 w-full hover:bg-zinc-800 p-2 rounded-lg transition-colors ${
                isCollapsed && !isOpenMobile ? "justify-center" : ""
              }`}
            >
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full border border-zinc-600"
              />
              {(!isCollapsed || isOpenMobile) && (
                <div className="text-left flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {userRole?.name || "No Role"}
                  </p>
                </div>
              )}
              {(!isCollapsed || isOpenMobile) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-500"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              )}
            </button>
          )}

          {/* User Switcher Dropdown */}
          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsUserMenuOpen(false)}
              ></div>
              <div className="absolute bottom-full left-4 mb-2 w-64 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-40 overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <p className="text-xs font-bold text-zinc-500 uppercase">
                    Switch User (Debug)
                  </p>
                </div>
                <ul className="py-1 max-h-48 overflow-y-auto">
                  {availableUsers.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => {
                          onSwitchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                          currentUser?.id === u.id
                            ? "bg-zinc-50 dark:bg-zinc-700/50 font-bold"
                            : ""
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          className="w-6 h-6 rounded-full"
                          alt=""
                        />
                        <span className="text-zinc-800 dark:text-zinc-200">
                          {u.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-zinc-100 dark:border-zinc-700 p-1">
                  <button
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Collapse Toggle - Hide on mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center p-2 mt-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="Toggle Sidebar"
          >
            {isCollapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
