import React from "react";
import "./Footer.css";

import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Left Section */}
        <div className="footer-section">
          <h2>Internship Approval</h2>
          <p>
            A centralized portal for students and coordinators to manage
            internship applications, approvals, evaluations, and progress
            efficiently.
          </p>
        </div>

  

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact</h3>

          <p>
            <FaEnvelope className="footer-icon" />
            internship@pes.edu
          </p>

          <p>
            <FaPhoneAlt className="footer-icon" />
            +91 80 2672 6622
          </p>

          <p>
            <FaMapMarkerAlt className="footer-icon" />
            PES University, Bengaluru
          </p>
        </div>

        {/* Social */}
        <div className="footer-section">
          <h3>Connect</h3>

          <div className="social-icons">

            <a href="#">
              <FaLinkedin />
            </a>
          </div>
        </div>

      </div>

      <hr />

      <div className="footer-bottom">
        © {year} Internship Approval Portal | PES University
      </div>

    </footer>
  );
};

export default Footer;
