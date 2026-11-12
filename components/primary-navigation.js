"use client";

import Link from "next/link";
import { useState } from "react";
import { navigation } from "../data/site-content";

const homeLink = navigation.find((item) => item.href === "/");
const sectionLinks = navigation.filter((item) => item.href !== "/");

export function PrimaryNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="primary-navigation" aria-label="Primary navigation">
      <div className="primary-navigation-inner">
        <Link className="primary-navigation-home" href={homeLink.href} onClick={() => setIsOpen(false)}>
          {homeLink.label}
        </Link>
        <button
          className="primary-navigation-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="primary-navigation-links"
          onClick={() => setIsOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {isOpen ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
          <span>{isOpen ? "Close menu" : "Menu"}</span>
        </button>
        <ul id="primary-navigation-links" className={isOpen ? "primary-navigation-links is-open" : "primary-navigation-links"}>
          {sectionLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setIsOpen(false)}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
