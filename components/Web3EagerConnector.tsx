import React from "react";
import { useEagerConnector } from "lib/web3";

export const Web3EagerConnector: React.FC = () => {
  useEagerConnector();
  return <></>;
};