import React from "react";
import withFillColor from "./utils/withFillColor";
import withAction from "./utils/withAction";

const ImageAlignLeftFillContent = ({ fill }) => {
  return (
    <svg width="25" height="25" fill={fill}>
      <path d="M21,15 L15,15 L15,17 L21,17 L21,15 Z M21,7 L15,7 L15,9 L21,9 L21,7 Z M15,13 L21,13 L21,11 L15,11 L15,13 Z M3,21 L21,21 L21,19 L3,19 L3,21 Z M3,3 L3,5 L21,5 L21,3 L3,3 Z M3,7 L3,17 L13,17 L13,7 L3,7 Z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </svg>
  );
};

export default withFillColor(withAction(ImageAlignLeftFillContent));
