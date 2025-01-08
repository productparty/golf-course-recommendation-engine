import React from "react";
import styles from "./Navigation.module.css";
import { NavigationLinkProps } from "./types";

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  label,
  isActive,
}) => {
  return (
    <div className={styles.navLink}>
      <span>{label}</span>
      {isActive && <div className={styles.activeIndicator} />}
    </div>
  );
};
