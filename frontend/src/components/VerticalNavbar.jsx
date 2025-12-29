import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Settings, GraduationCap, Menu, Bot, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "../contexts/theme-provider";
import ChatList from "./chat/ChatList";
import ContactList from "./contact/ContactList";

const VerticalNavbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { authUser, setShowMyProfile, createChat } = useAuthStore();
  const [activePage, setActivePage] = useState("/chat");
  const [isZoomed, setIsZoomed] = useState(false);
  useEffect(() => { }, [activePage])


  const contentTransition = { duration: 0.1, delay: 0.01 };

  const navItems = [
    { name: "Aram AI", path: "/chat", icon: <Bot size={22} /> },
    { name: "Lawyer", path: "/lawyer", icon: <GraduationCap size={22} /> },
    { name: "Contacts", path: "/contact", icon: <Users size={22} /> },
  ];

  return (
    <motion.div
      initial={{ width: 68 }}
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ type: "tween", duration: 0.2 }}
      className={`h-screen flex flex-col
    dark:bg-sidebar/30 bg-sidebar/60 backdrop-blur shadow-lg
    rounded-r-2xl fixed md:relative
    overflow-hidden`}
    >

      {/* 🔝 TOP SECTION */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-2">
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 w-fit rounded-lg hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10 transition"
        >
          <Menu size={22} />
        </button>

        {/* Nav Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map(({ name, path, icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => setActivePage(path)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2 rounded-xl
             transition-all duration-200 text-foreground
             ${isActive
                  ? "bg-[#494949]/10 dark:bg-[#494949]/30"
                  : "hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10"}`
              }
            >
              {icon}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap"
                  >
                    {name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* 🟢 MIDDLE SECTION (THIS IS THE KEY FIX) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 scrollbar-hide">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key={activePage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="h-full"
            >
              {activePage === "/chat" && (
                <ChatList
                  chats={authUser?.chats || []}
                  onNewChat={createChat}
                  userId={authUser?._id}
                />
              )}

              {activePage === "/contact" && <ContactList />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔽 BOTTOM SECTION */}
      <div
        className={`
    px-3 py-3 border-t border-muted
    flex gap-3
    ${collapsed ? "flex-col items-center" : "flex-row items-center"}
  `}
      >
        {/* Profile Button */}
        <button
          onClick={() => setShowMyProfile()}
          className={`
      flex items-center gap-3 rounded-xl transition
      hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10
      ${collapsed ? "" : "flex-1 p-2"}
    `}
        >
          <img
            src={authUser?.profilePic || `${import.meta.env.BASE_URL}/images/user.jpg`}
            className="w-9 h-9 rounded-full border-2 border-[#10B981]"
            alt="User"
          />

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-start whitespace-nowrap"
              >
                <p className="font-semibold text-sm">
                  {authUser?.firstName || "User"}
                </p>
                <p className="text-xs opacity-70">View Profile</p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Mode Toggle */}
        <div className={collapsed ? "" : "ml-auto"}>
          <ModeToggle />
        </div>
      </div>


    </motion.div>

  );
};

export default VerticalNavbar;