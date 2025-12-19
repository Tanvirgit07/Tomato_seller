/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User, Lock, LogOut } from "lucide-react";
// import ChangePasswordModal from "./ChangePasswordModal";
import Link from "next/link";
import { useSession } from "next-auth/react";
export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
      const user = session?.user as any;
      const email = user?.email;
      console.log(email)
      console.log(session)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlePersonalInformation = () => {
    console.log("Navigate to Personal Information");
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    console.log("Navigate to Change Password");
    setIsDropdownOpen(false);
    // setIsOpen(true);
  };

  const handleSignOut = () => {
    console.log("Sign out user");
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-[80px] items-center justify-between px-6 bg-[#212121] shadow-md">
      <div className="flex items-center space-x-2"></div>

      <div className="relative flex items-center space-x-3">
        <div
          ref={avatarRef}
          className="flex items-center space-x-2 text-white text-sm cursor-pointer hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
          onClick={toggleDropdown}
        >
          <span>{email}</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="text-black">TA</AvatarFallback>
          </Avatar>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-2 w-64 z-50"
          >
            <Card className="bg-red-500 border-0 shadow-lg">
              <CardContent className="p-0">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-red-400/30">
                  <div className="text-white font-medium text-base">
                    Bessie Edwards
                  </div>
                  <div className="text-red-100 text-sm">
                    bessieedwards@gmail.com
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link href="/personal-information">
                    <button
                      onClick={handlePersonalInformation}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-white hover:bg-red-600/50 transition-colors text-left"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Personal Information
                      </span>
                    </button>
                  </Link>

                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-white hover:bg-red-600/50 transition-colors text-left border-t border-red-400/30"
                  >
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Change Password</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-white hover:bg-red-600/50 transition-colors text-left border-t border-red-400/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* <ChangePasswordModal isOpen={isOpen} setIsOpen={setIsOpen} /> */}
    </div>
  );
}