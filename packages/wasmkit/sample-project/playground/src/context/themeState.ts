import { atom } from "recoil";
import React, { useState} from "react";


export const themeState = atom<{
//   address: string | undefined;
//   shortAddress: string | undefined;

}>({
  key: "themeState",
  default: (localStorage.getItem("theme")!) === null ? "Dark" : (localStorage.getItem("theme")!),
  dangerouslyAllowMutability: true,
});
