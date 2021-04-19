// @ts-ignore: Unreachable code error
import { Magic as MagicServer } from "@magic-sdk/admin";
import { Magic as MagicClient } from "magic-sdk";
import { isClient } from "lib/isClient";
import { RPCConnector } from "lib/rpc_connector";

export const magicServer = new MagicServer(process.env.NEXT_PUBLIC_MAGIC_SECRET_KEY);
export const magicClient = isClient()
  ? new MagicClient(process.env.NEXT_PUBLIC_MAGIC_KEY as string, {
      network: "ropsten",
    })
  : null;

export const magicRPCConnector = new RPCConnector({
  rpcProvider: magicClient?.rpcProvider,
  chainId: 3,
});