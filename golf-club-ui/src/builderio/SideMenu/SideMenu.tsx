import PropTypes from "prop-types";
import React from "react";
import "./side-menu.css";

interface Props {
  sidemenuVariant: "default";
  className: any;
}

export const SideMenu = ({
  sidemenuVariant,
  className,
}: Props): JSX.Element => {
  return (
    <div className={`side-menu ${className}`}>
      <div className="frame">
        <div className="rectangle" />

        <div className="home-synthetic-clone">Home</div>
      </div>

      <div className="recommend-course-wrapper">
        <div className="text-wrapper">Recommend Course</div>
      </div>

      <div className="find-course-wrapper">
        <div className="text-wrapper">Find Course</div>
      </div>
    </div>
  );
};

SideMenu.propTypes = {
  sidemenuVariant: PropTypes.oneOf(["default"]),
};
