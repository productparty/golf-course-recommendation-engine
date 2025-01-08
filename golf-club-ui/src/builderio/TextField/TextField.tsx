import PropTypes from "prop-types";
import React from "react";
import "./text-field.css";

interface Props {
  variant: "outlined";
  className: any;
  chevronDownLargeClassName: any;
}

export const TextField = ({
  variant,
  className,
  chevronDownLargeClassName,
}: Props): JSX.Element => {
  return (
    <div className={`text-field ${className}`}>
      <div className="english-synthetic">English</div>

      <img
        className={`chevron-down-large ${chevronDownLargeClassName}`}
        alt="Chevron down large"
      />
    </div>
  );
};

TextField.propTypes = {
  variant: PropTypes.oneOf(["outlined"]),
};
