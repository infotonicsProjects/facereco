import React from "react";

const Loader = ({ isLoading }) => {
  return (
    <>
      {isLoading ? (
        <div className="">
          <svg class="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
            jhjf
          </svg>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Loader;
