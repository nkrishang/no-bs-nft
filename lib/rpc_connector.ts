/* eslint-disable */

import { ConnectorUpdate } from "@web3-react/types";
import { AbstractConnector } from "@web3-react/abstract-connector";

interface RPCConnectorArguments {
  rpcProvider: any /*RPCProviderModule*/;
  chainId: number;
}

export class RPCConnector extends AbstractConnector {
  private readonly chainId: number;
  private readonly rpcProvider: any;

  public magic: any;

  constructor({ rpcProvider, chainId }: RPCConnectorArguments) {
    super({ supportedChainIds: [chainId] });

    this.rpcProvider = rpcProvider;
    this.chainId = chainId;
  }

  public async activate(): Promise<ConnectorUpdate> {
    const provider = this.rpcProvider;
    const account = await provider
      .enable()
      .then((accounts: string[]): string => accounts[0]);

    return { provider, chainId: this.chainId, account };
  }

  public async getProvider(): Promise<any> {
    return this.rpcProvider;
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId;
  }

  public async getAccount(): Promise<null | string> {
    return this.rpcProvider
      .send("eth_accounts")
      .then((accounts: string[]): string => accounts[0]);
  }

  public deactivate() {}

  public async close() {
    this.emitDeactivate();
  }
}