import React from "react";
import { NavLink, Outlet } from "react-router";
import "../../assets/styles/NavbarWelcome.css";

export default function NavbarWelcome() {
    return (
        <>
            <div className="welcome-navbar">
                <nav className="welcome-navbar-links">
                    <NavLink
                        to="/welcome"
                        className={({ isActive }) => isActive ? "active" : undefined}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) => isActive ? "active" : undefined}
                    >
                        About
                    </NavLink>
                    {/* <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : undefined}>Contact</NavLink> */}
                </nav>
            </div>
            <Outlet />
        </>
    );
}
