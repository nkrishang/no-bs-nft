import React from "react";
import { useEagerConnect } from "lib/web3";

export const Web3EagerConnector: React.FC = () => {
  useEagerConnect();
  return <></>;
};