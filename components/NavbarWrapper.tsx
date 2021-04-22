import { useContext } from 'react';

import { ContractContext, ContractWrapper } from "lib/AppContext";
import Navbar from 'components/Navbar';
import CollectionList  from 'components/CollectionList';

export default function NavbarWrapper({ children }: any): JSX.Element {

  const { contracts } = useContext(ContractContext);
  
  return (
    <>
      <Navbar />
      {children}
      <CollectionList NFTs={contracts}/>
    </>
    )
  }