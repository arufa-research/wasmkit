import { atom } from "recoil";

export const showUsershowState = atom<{
  checkLoading: boolean;
  // input2: string;
  // swapRate: string;
//   slippage: string;
}>({
  key: "showUsershowState",
  default: {
    checkLoading: false,
    // slippage: "0.005",
  },
  dangerouslyAllowMutability: true,
});
