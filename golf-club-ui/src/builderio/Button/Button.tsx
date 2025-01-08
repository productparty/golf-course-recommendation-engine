import PropTypes from "prop-types";
import React from "react";
import "./button.css";

interface Props {
  color: "primary";
  size: "medium";
  className: any;
  subscribeSyntheticClassName: any;
  text: string;
}

export const Button = ({
  color,
  size,
  className,
  subscribeSyntheticClassName,
  text = "Subscribe",
}: Props): JSX.Element => {
  return (
    <button className={`button ${className}`}>
      <div className={`subscribe-synthetic ${subscribeSyntheticClassName}`}>
        {text}
      </div>
    </button>
  );
};

Button.propTypes = {
  color: PropTypes.oneOf(["primary"]),
  size: PropTypes.oneOf(["medium"]),
  text: PropTypes.string,
};
