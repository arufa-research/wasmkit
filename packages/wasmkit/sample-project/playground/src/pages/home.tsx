import React, { useEffect, useState } from "react";
import contractName from "../../src/contracts.json";
import Instantiate from "./instantiate";
import Execute from "./execute";
import Query from "./query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderSocials from "./socials/socials";
import "./home.css";
import "../components/common/buttons/buttons.css";
import NetSwitch from "./netswitch";
import logolight from "../assets/img/wasm_kit_logo_6_white.png";
import logodark from "../assets/img/wasm_kit_logo_6_dark.png";
import { themeState } from "../context/themeState";
import { useRecoilValue } from "recoil";
import { useConnectWallet } from "../hooks/useTxnClient";
import { walletState } from "../context/walletState";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
function Home() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [active, setActive] = useState(false);
  const [activeContract, setActiveContract] = useState<string>(
    contractName[activeIndex]
  );

  const handleNavClick = (sectionName: string) => {
    setActiveSection(sectionName);
  };

  const handleSidebarClick = (index: number) => {
    setActiveIndex(index);
    setActiveContract(contractName[index]);
  };
  const { address } = useRecoilValue(walletState);
  const root = document.querySelector(":root");
  const theme = useRecoilValue(themeState);
  const connectWallet = useConnectWallet();
  useEffect(() => {
    if (theme === "Light") {
      root?.classList.add("lighttheme");
    }
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn || isLoggedIn === "true") {
      if (address === undefined) {
        connectWallet();
      }
    }
  }, []);
  return (
    <>
      <div className="home-page">
        {/* <div className='container'> */}
        <div className="handle-side">
          <div
            className="menuIcon"
            onClick={() => {
              setActive(!active);
            }}
          >
            <div className="menuIcon-icon">
              <FontAwesomeIcon icon={active ? faXmark : faBars} />
            </div>
          </div>
          <div className={active ? "sidebar active" : "sidebar"}>
            <div className="text-logo-container">
              <img
                className="text-logo-img"
                src={theme === "Light" ? logodark : logolight}
              />
              <h2>Playground</h2>
            </div>

            <div className="sidebar-menu">
              {contractName.map((name, index) => (
                <div
                  className={`${
                    activeContract === name
                      ? "sidebar-button__active"
                      : "sidebar-button"
                  }`}
                >
                  <button onClick={() => handleSidebarClick(index)}>
                    {" "}
                    {name}
                  </button>
                </div>
              ))}
            </div>
            {/* <HeaderSocials></HeaderSocials> */}
          </div>
        </div>
        <div className="container">
          <NetSwitch></NetSwitch>
          <div className="navbar">
            <div className="description">{activeContract}</div>
            <button
              onClick={() => handleNavClick("instantiate")}
              className={`${
                activeSection !== "query" && activeSection !== "execute"
                  ? "nav-active"
                  : "navbar-item"
              }`}
            >
              {/* <div className="instantiate"> */}
              <div className="nav-heading">Instantiate</div>
              <div className="nav-subheading">
                {`Create new ${activeContract}`}
              </div>
              {/* </div> */}
            </button>
            <button
              onClick={() => handleNavClick("query")}
              className={`${
                activeSection === "query" ? "nav-active" : "navbar-item"
              }`}
            >
              {/* <div className="query"> */}
              <div className="nav-heading">Query</div>
              <div className="nav-subheading">
                {`Dispatch query with your ${activeContract} contract`}
                {/* </div> */}
              </div>
            </button>
            <button
              onClick={() => handleNavClick("execute")}
              className={` ${
                activeSection === "execute" ? "nav-active" : "navbar-item"
              }`}
            >
              {/* <div className="execute"> */}
              <div className="nav-heading">Execute</div>
              <div className="nav-subheading">
                {`Execute ${activeContract} contract actions`}
              </div>
              {/* </div> */}
            </button>
          </div>
        </div>

        <div className="playground">
          {activeSection !== "instantiate" &&
            activeSection !== "execute" &&
            activeSection !== "query" && (
              <Instantiate contractName={activeContract} />
            )}
          {activeSection === "instantiate" && (
            <Instantiate contractName={activeContract}></Instantiate>
          )}
          {activeSection === "execute" && (
            <Execute contractName={activeContract} />
          )}
          {activeSection === "query" && <Query contractName={activeContract} />}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Home;
