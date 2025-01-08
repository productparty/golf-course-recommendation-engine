import React from "react";
import styles from "./Navigation.module.css";
import { NavigationButton } from "./NavigationButton";
import { NavigationLink } from "./NavigationLink";

export const Navigation: React.FC = () => {
  const navLinks = [
    { label: "Home", isActive: true },
    { label: "Find Course", isActive: false },
    { label: "Recommend Course", isActive: false },
  ];

  const authButtons = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/c8decda9cb6726d7b830b78269710cd7c486d2957263ecd5b8fb21d02cde525a?placeholderIfAbsent=true&apiKey=9e1847323d5241858d1db34992e94222",
      label: "Sign Up",
      variant: "secondary" as const,
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/821b9070d0289274a27f8581204a304a81055e69a65d6d0b395494c09086fffc?placeholderIfAbsent=true&apiKey=9e1847323d5241858d1db34992e94222",
      label: "Sign In",
      variant: "primary" as const,
    },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.brandSection}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/77a24dc57639d26939b3ee58a9557092803bbb4e29fc613a6e982727f846cf6d?placeholderIfAbsent=true&apiKey=9e1847323d5241858d1db34992e94222"
            alt="Golf Course Finder Logo"
            className={styles.brandLogo}
          />
          <span className={styles.brandName}>Golf Course Finder</span>
        </div>
        <div className={styles.navLinks}>
          {navLinks.map((link, index) => (
            <NavigationLink key={index} {...link} />
          ))}
        </div>
      </div>
      <div className={styles.authButtons}>
        {authButtons.map((button, index) => (
          <NavigationButton key={index} {...button} />
        ))}
      </div>
    </nav>
  );
};
