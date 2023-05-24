import React, { FC } from "react";

type headings = {
  heading: string | number;
  subheading: string | number;
};

const Headlines: FC<headings> = ({ heading, subheading }) => {
  return (
    <div className="heading">
      {heading}
      <br></br>
      {subheading}
    </div>
  );
};

export default Headlines;
