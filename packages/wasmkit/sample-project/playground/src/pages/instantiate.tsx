import React from "react";
import contractInfo from "../../src/counter.json";
import { contractInformation } from "../types/configTypes";
import Headlines from "./headlines";
const info: contractInformation = contractInfo;
function Instantiate(contractName: any = "counter") {
  //  console.log(contractName);
  //  let t  = "counter";

  // console.log(info);

  const contract: string = contractName["contractName"];
  //  console.log(info[contract]["testnet"]["deployInfo"]["codeId"]);
  return (
    <div className="instantiate-page">
      <br></br>

      <Headlines
        heading="Code ID"
        subheading={info[contract]["testnet"]["deployInfo"]["codeId"]}
      ></Headlines>

      <br></br>

      <Headlines
        heading="Contract Address"
        subheading={
          info[contract]["testnet"]["instantiateInfo"]["contractAddress"]
        }
      ></Headlines>
    </div>
  );
}

export default Instantiate;
