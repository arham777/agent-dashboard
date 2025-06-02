import React from "react";

const PageLoader = () => {
  return (
    <div className="flex justify-center items-center  w-full bg-white">
      <div className="loader ">
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__ball"></div>
      </div>
    </div>
  );
};

export default PageLoader;
