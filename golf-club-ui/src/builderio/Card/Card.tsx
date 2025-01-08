import PropTypes from "prop-types";
import React from "react";
import "./card.css";

interface Props {
  cardVariant: "default";
  className: any;
  text: string;
  text1: string;
  text2: string;
  iconButtonClassName: any;
  containerClassName: any;
}

export const Card = ({
  cardVariant,
  className,
  text = "Feedback",
  text1 = "Course Reviews",
  text2 = "Read and share reviews to help golfers choose the best courses.",
  iconButtonClassName,
  containerClassName,
}: Props): JSX.Element => {
  return (
    <div className={`card ${className}`}>
      <div className="feedback-synthetic">{text}</div>

      <div className="course-reviews">{text1}</div>

      <p className="read-and-share">{text2}</p>

      <img className={`icon-button ${iconButtonClassName}`} alt="Icon button" />

      <img className={`container ${containerClassName}`} alt="Container" />
    </div>
  );
};

Card.propTypes = {
  cardVariant: PropTypes.oneOf(["default"]),
  text: PropTypes.string,
  text1: PropTypes.string,
  text2: PropTypes.string,
};
