import PropTypes from "prop-types";
import React from "react";
import "./rating.css";

interface Props {
  numberOfStars: "five";
  className: any;
}

export const Rating = ({ numberOfStars, className }: Props): JSX.Element => {
  return <img className={`rating ${className}`} alt="Number of stars" />;
};

Rating.propTypes = {
  numberOfStars: PropTypes.oneOf(["five"]),
};
