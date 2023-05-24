import React from "react";
import contractName from "../../src/contracts.json";
import ConnectWalletButton from "./common/buttons/connectWallet";
import "./sidebar.css";
function SideNavbar(): JSX.Element {
  return (
    <div className="sidebar">
      <ConnectWalletButton></ConnectWalletButton>

      <ul>
        {contractName.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

export default SideNavbar;
