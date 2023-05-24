import {
  CosmWasmClient,
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions,
} from "@cosmjs/cosmwasm-stargate";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { walletState } from "../context/walletState";
import { Contract } from "../hooks/clients/contract";
import contractInfo from "../../src/counter.json";
import { ClassStructure, Property, Coin } from "../types/configTypes";
import Preview from "./preview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

const clas = require("../../src/counterInf.json");
const stk = "StakingContract";
const count = "Counter";
function Query(contractName: any) {
  const contract = contractName["contractName"];
  const interfaceName =
    contract === "counter" ? "CounterInterface" : "StakingContractInterface";
  // console.log(clas[contract]);
  const classInfo = clas[contract] as ClassStructure[];
  //  console.log(contract);
  const className =
    contract === "counter"
      ? "CounterQueryContract"
      : "StakingContractQueryContract";
  const classStructure = classInfo.find((structure) => {
    return structure.kind === "class" && structure.name === className;
  });
  const interfaceStructure = classInfo.find((structure) => {
    return structure.kind === "interface" && structure.name === interfaceName;
  });
  const val = useRecoilValue(walletState);
  const [queryres, setqueryRes] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  // const CustomSelect = (item:any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("");
    useEffect(() => {
      console.log("s");
      setSelectedOption("");
      setqueryRes("");
     // Reset the selected option when the options prop changes
    },[contractName]);
 
  
  

  let propertiesJsx = null;
  let prop: string[] = [];
  console.log("hehe", interfaceStructure)
  if (!classStructure) {
    return <div>Class {className} not found in JSON file.</div>;
  } else {
    if (!classStructure.properties || classStructure.properties.length === 0) {
      propertiesJsx = <div>Class {className} has no properties.</div>;
    } else {
      classStructure.properties.map((property) => prop.push(property.name));
    }
  }
  const msg = {
    get_count: {},
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleOptionClick = (item :string) => {
    setSelectedOption(item);
    setIsOpen(false);
  };

  const temp = new Contract(
    val.client as SigningCosmWasmClient,
    val.client as CosmWasmClient,
    contractInfo.counter.testnet.instantiateInfo.contractAddress
  );

  const query = async ()=>{
    console.log("response", contractInfo.counter.testnet.instantiateInfo.contractAddress,temp);
   const ans = await temp.queryMsg({
    get_count: {}
  });
   console.log("query response", ans, contractInfo.counter.testnet.instantiateInfo.contractAddress);
   return ans;
  }
  query();

  const handlebtnclick = async()=>{
    const res = await query();
    setqueryRes(res.count as string);
  }

  function handleSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedItem(event.target.value);
  }

  return (
    <>
    <div className="query-page">
      {/* <p>Class ${className} found in JSON file.</p> */}
      {/* {propertiesJsx} */}

      {/* <button onClick={handlebtnclick}>Click to query </button> */}
      {/* {propertiesJsx} */}

      {/* <div>
           {queryres !== "" ?
           queryres
           :
           <></>
           }
         </div> */}
      <div className="menubar">
        <label htmlFor="menu">Select your query : </label>
        
        {/* <select
          id="menu"
          className="query-menu"
          value={selectedItem}
          onChange={handleSelect}
        >
          <option value="" selected disabled>
            Choose an option
          </option>
          {prop.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select> */}
        <div className="custom-select">
      <div className="select-selected" onClick={toggleDropdown}>
        {selectedOption ? selectedOption : "Select an option"}
        <div className="angleDown">
        <FontAwesomeIcon icon={faAngleDown} size="lg" />
        </div>
      </div>
      {isOpen && (
        <div className="select-items">
          {prop.map((item) => (
            <div
              key={item}
              className="select-item"
              onClick={() => handleOptionClick(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
    


        <p>You have selected: {selectedOption === "" ? "None" : selectedOption}</p>
         <div className="result">
         <button className="btn primary-btn" onClick={handlebtnclick}>Click to query </button>
         {queryres && (
        <div className="output-area">
          <label htmlFor="output">Query Outcome: </label>
          <input id="output" value={queryres} readOnly />
        </div>
      )}
        
         </div>

      </div>
      <Preview msg={msg}></Preview>
     


    </div>
    </>
  );
}

export default Query;
