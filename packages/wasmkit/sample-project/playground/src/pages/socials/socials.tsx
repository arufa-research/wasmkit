import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faDiscord,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";

import "./socials.css";
import { faBug } from "@fortawesome/free-solid-svg-icons";

const HeaderSocials = (props: any) => {
  return (
    <div className="social-header-wrapper">
      <div className={`social-header`}>
        <div className="social-header-icon ">
          <a target="_blank" href="https://discord.gg/gKjzApDstD">
            <FontAwesomeIcon icon={faDiscord} size="lg" />
          </a>
        </div>
        <div className="social-header-icon ">
          <a target="_blank" href="https://twitter.com/StakeEasy">
            <FontAwesomeIcon icon={faTwitter} size="lg" />
          </a>
        </div>
        <div className="social-header-icon ">
          <a target="_blank" href="https://t.me/StakeEasyProtocol">
            <FontAwesomeIcon icon={faTelegram} size="lg" />
          </a>
        </div>
        <div className="social-header-icon ">
          <a target="_blank" href="https://discord.gg/gKjzApDstD">
            <FontAwesomeIcon icon={faBug} size="lg" />
          </a>
        </div>
      </div>
    </div>
  );
};
export default HeaderSocials;
