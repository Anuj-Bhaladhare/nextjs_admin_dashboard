"use client";

import React from "react";

const AuthIcons = () => {

  function ShieldIcon({ className = "" }: { className?: string }) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 3 19 6v5.5c0 4.4-2.8 7.8-7 9.5-4.2-1.7-7-5.1-7-9.5V6l7-3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  function MailIcon() {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
        <rect
          height="12"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          width="15"
          x="2.5"
          y="4"
        />
        <path
          d="m3.5 5.5 6.5 5 6.5-5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  function UserIcon() {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
        <circle
          cx="10"
          cy="6.25"
          r="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3.5 17c.5-3.1 2.9-4.75 6.5-4.75s6 1.65 6.5 4.75"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  function PhoneIcon() {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
        <path
          d="M6.1 2.75h2.1l1 3.4-1.5 1.4a12 12 0 0 0 4.75 4.75l1.4-1.5 3.4 1v2.1a2 2 0 0 1-2.2 2.05A13.25 13.25 0 0 1 4.05 5a2 2 0 0 1 2.05-2.25Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  function EyeIcon({ visible }: { visible: boolean }) {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
        <path
          d="M2.5 10s2.7-4.5 7.5-4.5 7.5 4.5 7.5 4.5-2.7 4.5-7.5 4.5S2.5 10 2.5 10Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        {visible ? (
          <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
        ) : (
          <path
            d="m4 16 12-12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        )}
      </svg>
    );
  }

  return {
    ShieldIcon, 
    MailIcon, 
    UserIcon, 
    PhoneIcon, 
    EyeIcon
  }

}

export default AuthIcons;
