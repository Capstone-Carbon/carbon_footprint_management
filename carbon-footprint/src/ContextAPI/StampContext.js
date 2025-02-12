import React, { createContext, useState } from "react";

export const StampContext = createContext();

export const StampProvider = ({ children }) => {
  const [stampCount, setStampCount] = useState(3); // 현재 스탬프 개수

  return (
    <StampContext.Provider value={{ stampCount, setStampCount }}>
      {children}
    </StampContext.Provider>
  );
};
