import React, { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const ContentElement = ({ contact, onClick, isActive, isOnline }) => {
  const { authUser } = useAuthStore();
  const contactUser = contact.contactUser || {};
  const lastMessage = contact.lastMessage?.content || "";

  useEffect(() => {
    const img = new Image();
    img.src =
      contactUser.profilePic ||
      `${import.meta.env.BASE_URL}/images/user.jpg`;
  }, [contactUser.profilePic]);

  const isUnread =
    contact.lastMessage &&
    contact.lastMessage.receiverId === authUser._id &&
    !contact.lastMessage.read;

  const timeText = contact.lastMessage?.createdAt
    ? new Date(contact.lastMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      onClick={() => onClick(contact)}
      className={`
        flex items-center gap-3 px-4 py-3 w-full
        cursor-pointer transition-colors border-b border-muted
        ${isActive ? "bg-emerald-500/15" : "hover:bg-emerald-500/10"}
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={
            contactUser.profilePic ||
            `${import.meta.env.BASE_URL}/images/user.jpg`
          }
          alt={contactUser.firstName || "User"}
          draggable={false}
          className="w-12 h-12 rounded-xl object-cover"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
            isOnline ? "bg-emerald-500" : "bg-gray-400"
          }`}
        />
      </div>

      {/* Center content */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">
            {`${contactUser.firstName || ""} ${
              contactUser.lastName || ""
            }`.trim() || "Unknown User"}
          </h4>

          {isUnread && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
              New
            </span>
          )}
        </div>

        <p
          className={`text-xs truncate ${
            isUnread ? "font-semibold opacity-90" : "opacity-70"
          }`}
        >
          {lastMessage || "No messages yet"}
        </p>
      </div>

      {/* Right content */}
      <div className="flex flex-col items-end gap-1 shrink-0 text-[11px] opacity-70">
        <span>{timeText}</span>
      </div>
    </div>
  );
};

export default ContentElement;
