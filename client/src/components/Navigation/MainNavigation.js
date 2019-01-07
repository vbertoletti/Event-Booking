import React from "react";
import { NavLink } from "react-router-dom";
import "./MainNavigation.css";

const MainNavigation = props => (
  <header className="main-nav">
    <div className="main-nav-logo">
      <h1>Events Land</h1>
    </div>
    <nav className="main-nav-items">
      <ul>
        <li>
          <NavLink to="/auth">Login</NavLink>
        </li>
        <li>
          <NavLink to="/events">Events</NavLink>
        </li>
        <li>
          <NavLink to="/bookings">Bookings</NavLink>
        </li>
      </ul>
    </nav>
  </header>
);

export default MainNavigation;
