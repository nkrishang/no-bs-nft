import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function useGasPrice(chainId: number = 1): any {

  const [gasPrice, setGasPrice] = useState<string>('');
  const [ethPrice, setEthPrice] = useState<string>('');
  const [maticPrice, setMaticPrice] = useState<string>('');
  const [costEstimates, setCostEstimates] = useState<any>('');

  const uploadTransactionGas = useRef(300000);
  const deployTransactionGas = useRef(6550000)
  
  useEffect(() => {

    const getGasPrice = async () => {
      const res = await axios.get(
        `https://ethgasstation.info/api/ethgasAPI.json?api-key=${process.env.NEXT_PUBLIC_GASPRICE_API_KEY}`
      )

      if(res.status == 200) {
        const { data } = res
        console.log("Fast gas price in gwei: ", data.fast / 10);

        setGasPrice((data.fast / 10).toString());
      } else {
        console.log("gas price response failed: ", res);
      }
    }
    
    // TEMPORARY -- hard coded gas prices.
    switch (chainId) {
      case 1:
        // getGasPrice()
        setGasPrice('150');
        break;
      case 3:
        setGasPrice('10');
        break;
      case 80001:
        setGasPrice('10')
        break;
      case 137:
        setGasPrice('10');
        break;
      default:
        break;
    }
  }, [chainId])

  const getEthPrice = async () => {
      
    try {
      const res = await axios.get(
        `https://rest.coinapi.io/v1/exchangerate/ETH/USD?apikey=${process.env.NEXT_PUBLIC_COINAPI_KEY}`
      )
      
      if(res.status == 200) {
        const { data } = res;
        console.log("ETH PRICE: ", (data.rate).toString())
        return parseFloat((data.rate).toString())
      } else {
        console.log("Coin API for eth failed: ", res);
        return 0
      }
    } catch(err) {
      console.log(err)
      return 0
    }      
  }

  const getMaticPrice = async () => {
      
    try {
      const res = await axios.get(
        `https://rest.coinapi.io/v1/exchangerate/MATIC/USD?apikey=${process.env.NEXT_PUBLIC_COINAPI_KEY}`
      )

      if(res.status == 200) {          
        const { data } = res;
        console.log("MATIC PRICE: ", (data.rate).toString())
        return parseFloat((data.rate).toString());
      } else {
        console.log("Coin API for matic failed: ", res);
        return 0
      }
    } catch(err) {
      console.log(err)
      return 0
    }      
  }

  const getCostEstimates = (price: number) => {
    const uploadCost: number = (
      ( (uploadTransactionGas.current) * price ) / 10**9
    )

    const deployCost: number = (
      ( (deployTransactionGas.current) * parseInt(gasPrice) * price ) / 10**9
    )

    const uploadCostDecimals = (uploadCost.toString()).split('.')
    const formattedUploadCost = uploadCostDecimals[0] + '.' + (
      uploadCostDecimals[1].length > 3 ? uploadCostDecimals[1].slice(0,6) : uploadCostDecimals[1]
    );
    
    const deployCostEthDecimals = (deployCost.toString()).split('.')
    
    const formattedDeployCost = deployCostEthDecimals[0] + '.' + (
      deployCostEthDecimals[1].length > 3 ? deployCostEthDecimals[1].slice(0,3) : deployCostEthDecimals[1]
    );

    return {
      uploadCost: formattedUploadCost,
      deployCost: formattedDeployCost
    }
  }

  const getCost = async () => {
    const eth: number = await getEthPrice();
    const matic: number = await getMaticPrice();
    console.log(`eth: ${eth} matic ${matic}`)
    if (eth == 0 || matic == 0) {
      return {
        uploadCost: {
          eth: 0,
          matic: 0
        },
        deployCost: {
          eth: 0,
          matic: 0
        }
      }
    }

    const ethCosts = getCostEstimates(eth);
    const maticCosts = getCostEstimates(matic);

    return {
      uploadCost: {
        eth: ethCosts.uploadCost,
        matic: maticCosts.uploadCost
      },
      deployCost: {
        eth: ethCosts.deployCost,
        matic: maticCosts.deployCost
      }
    }
  }

  // useEffect(() => {

  //   const getEthPrice = async () => {
      
  //     try {
  //       const res = await axios.get(
  //         `https://rest.coinapi.io/v1/exchangerate/ETH/USD?apikey=${process.env.NEXT_PUBLIC_COINAPI_KEY}`
  //       )
        
  //       if(res.status == 200) {
  //         const { data } = res;
  //         setEthPrice(parseInt((data.rate).toString()).toString());
  //       } else {
  //         console.log("Coin API for eth failed: ", res);
  //       }
  //     } catch(err) {
  //       console.log(err)
  //     }      
  //   }

  //   const getMaticPrice = async () => {
      
  //     try {
  //       const res = await axios.get(
  //         `https://rest.coinapi.io/v1/exchangerate/MATIC/USD?apikey=${process.env.NEXT_PUBLIC_COINAPI_KEY}`
  //       )

  //       if(res.status == 200) {          
  //         const { data } = res;
  //         setMaticPrice(parseFloat((data.rate).toString()).toString());
  //         console.log("MATIC price: ", parseFloat((data.rate).toString()).toString())
  //       } else {
  //         setMaticPrice('0');
  //         console.log("Coin API for matic failed: ", res);
  //       }
  //     } catch(err) {
  //       console.log(err)
  //     }      
  //   }

  //   switch (chainId) {
  //     case 1:
  //       getEthPrice()
  //       break;
  //     case 3:
  //       setEthPrice('0');
  //       break;
  //     case 80001:
  //       setMaticPrice('0');
  //       break;
  //     case 137:
  //       getMaticPrice();
  //       break;
  //     default:
  //       break;
  //   }
  // }, [chainId])

  // useEffect(() => {
    
    // if(chainId == 3 || chainId == 1) {
    //   if(ethPrice && gasPrice) {
    //     const costOfUploadTransaction: number = (
    //       ( (uploadTransactionGas.current) * parseInt(gasPrice) * parseInt(ethPrice) ) / 10**9
    //     )

    //     const costOfDeployTransaction: number = (
    //       ( (deployTransactionGas.current) * parseInt(gasPrice) * parseInt(ethPrice) ) / 10**9
    //     )

    //     console.log("rETH price: ", ethPrice)
    //     console.log("cost of deploy tx eth: ", costOfDeployTransaction.toString())
    //     setCostEstimates({
    //       uploadTransaction: parseInt(costOfUploadTransaction.toString()).toString(),
    //       deployTransaction: parseInt(costOfDeployTransaction.toString()).toString()
    //     })
    //   }
  //   } else if (chainId == 137 || chainId == 80001) {
  //     if(maticPrice && gasPrice) {
  //       const costOfUploadTransaction: number = (
  //         ( (uploadTransactionGas.current) * parseInt(gasPrice) * parseFloat(maticPrice) ) / 10**9
  //       )
        
  //       const costOfDeployTransaction: number = (
  //         ( (deployTransactionGas.current) * parseInt(gasPrice) * parseFloat(maticPrice) ) / 10**9
  //       )

  //       console.log("matic price: ", maticPrice)
  //       console.log("cost of deploy tx matic: ", costOfDeployTransaction.toString())
  //       setCostEstimates({
  //         uploadTransaction: parseInt(costOfUploadTransaction.toString()).toString(),
  //         deployTransaction: (costOfDeployTransaction.toString())
  //       })
  //     }
  //   }

  // }, [maticPrice, ethPrice, gasPrice])

  // return {ethPrice, maticPrice, gasPrice, costEstimates, gasEstimates: {
  //   uploadTransaction: uploadTransactionGas.current
  // }}

  return {getCost, gasPrice, gasEstimates: {
    uploadTransaction: uploadTransactionGas.current,
    deployTransactionGas: deployTransactionGas.current
  }}
}