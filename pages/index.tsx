import ConnectButton from "components/ConnectButton";
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

export default function App() {
  const context = useWeb3React<Web3Provider>()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

  return (
    <>
      <ConnectButton />
    </>
  )
}