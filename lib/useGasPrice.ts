import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function useGasPrice(chainId: number): any {

  const [gasPrice, setGasPrice] = useState<string>('');
  const [ethPrice, setEthPrice] = useState<string>('');
  const [maticPrice, setMaticPrice] = useState<string>('');
  const [costEstimates, setCostEstimates] = useState<any>('');

  const uploadTransactionGas = useRef(250000);
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
    
    switch (chainId) {
      case 1:
        getGasPrice()
        break;
      case 3:
        setGasPrice('10');
        break;
      case 80001:
        setGasPrice('100')
        break;
      case 137:
        setGasPrice('50');
        break;
      default:
        break;
    }
  }, [chainId])

  useEffect(() => {

    const getEthPrice = async () => {
      
      try {
        const res = await axios.get(
          `https://rest.coinapi.io/v1/exchangerate/ETH/USD?apikey=${process.env.NEXT_PUBLIC_COINAPI_KEY}`
        )
        
        if(res.status == 200) {
          const { data } = res;
          setEthPrice(parseInt((data.rate).toString()).toString());
        } else {
          console.log("Coin API for eth failed: ", res);
        }
      } catch(err) {
        console.log(err)
      }      
    }

    const getMaticPrice = async () => {
      
      try {
        const res = await axios.get(
          `https://rest.coinapi.io/v1/exchangerate/MATIC/USD?apikey=${process.env.NEXT_PUBLIC_COINAPI_KEY}`
        )

        if(res.status == 200) {          
          const { data } = res;
          setMaticPrice(parseFloat((data.rate).toString()).toString());
          console.log("MATIC price: ", parseFloat((data.rate).toString()).toString())
        } else {
          setMaticPrice('0');
          console.log("Coin API for matic failed: ", res);
        }
      } catch(err) {
        console.log(err)
      }      
    }

    switch (chainId) {
      case 1:
        getEthPrice()
        break;
      case 3:
        setEthPrice('0');
        break;
      case 80001:
        setMaticPrice('0');
        break;
      case 137:
        getMaticPrice();
        break;
      default:
        break;
    }
  }, [chainId])

  useEffect(() => {
    
    if(chainId == 3 || chainId == 1) {
      if(ethPrice && gasPrice) {
        const costOfUploadTransaction: number = (
          ( (uploadTransactionGas.current) * parseInt(gasPrice) * parseInt(ethPrice) ) / 10**9
        )

        const costOfDeployTransaction: number = (
          ( (deployTransactionGas.current) * parseInt(gasPrice) * parseInt(ethPrice) ) / 10**9
        )

        console.log("rETH price: ", ethPrice)
        console.log("cost of deploy tx eth: ", costOfDeployTransaction.toString())
        setCostEstimates({
          uploadTransaction: parseInt(costOfUploadTransaction.toString()).toString(),
          deployTransaction: parseInt(costOfDeployTransaction.toString()).toString()
        })
      }
    } else if (chainId == 137 || chainId == 80001) {
      if(maticPrice && gasPrice) {
        const costOfUploadTransaction: number = (
          ( (uploadTransactionGas.current) * parseInt(gasPrice) * parseFloat(maticPrice) ) / 10**9
        )
        
        const costOfDeployTransaction: number = (
          ( (deployTransactionGas.current) * parseInt(gasPrice) * parseFloat(maticPrice) ) / 10**9
        )

        console.log("matic price: ", maticPrice)
        console.log("cost of deploy tx matic: ", costOfDeployTransaction.toString())
        setCostEstimates({
          uploadTransaction: parseInt(costOfUploadTransaction.toString()).toString(),
          deployTransaction: (costOfDeployTransaction.toString())
        })
      }
    }

  }, [maticPrice, ethPrice, gasPrice])

  return {ethPrice, maticPrice, gasPrice, costEstimates, gasEstimates: {
    uploadTransaction: uploadTransactionGas.current
  }}
}