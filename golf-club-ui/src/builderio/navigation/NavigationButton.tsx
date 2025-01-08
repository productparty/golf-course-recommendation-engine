import React from "react";
import styles from "./Navigation.module.css";
import { ButtonProps } from "./types";

export const NavigationButton: React.FC<ButtonProps> = ({
  icon,
  label,
  variant,
}) => {
  const buttonClass =
    variant === "primary" ? styles.primaryButton : styles.secondaryButton;

  return (
    <button className={buttonClass}>
      <img loading="lazy" src={icon} alt="" className={styles.buttonIcon} />
      <span>{label}</span>
    </button>
  );
};
