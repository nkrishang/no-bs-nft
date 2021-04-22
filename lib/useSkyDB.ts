import { useEffect, useRef } from "react";
import { genKeyPairFromSeed, SkynetClient } from "skynet-js";

// Hook with default skyDB settings
export function useDefaultSkyDB(): any {
  return useSkyDB(
    "transactions and NFTs",
    process.env.NEXT_PUBLIC_SKYDB_SEED || ""
  );
}

export default function useSkyDB(dataKey: string, seed: string): any {
  // ===== SKYLINK / SKYNET =====
  const skyPortalRef = useRef<any>();
  const skydbPrivateKey = useRef<any>();
  const skydbPublicKey = useRef<any>();

  // Initialize skyDB client
  useEffect(() => {
    const portal = "https://siasky.net/";
    skyPortalRef.current = new SkynetClient(portal);

    const { privateKey, publicKey } = genKeyPairFromSeed(seed);

    skydbPrivateKey.current = privateKey;
    skydbPublicKey.current = publicKey;
  }, [seed]);

  // CAUTION: Function to directly upload JSON to skyDB, DOES NOT CHECK validity
  const uploadToSkyDB = async (document: Record<string, any>) => {
    try {
      await skyPortalRef.current.db.setJSON(
        skydbPrivateKey.current,
        dataKey,
        document
      );

      // console.log("Uploading to SkyDB: ", document);
    } catch (error) {
      console.log(error);
    }
  };

  // Function to get all data from skyDB as JSON (not exported)
  const getDataFromSkyDB = async () => {
    console.log("Calling getDataFromSkyDB")
    try {
      const { data, revision } = await skyPortalRef.current.db.getJSON(
        skydbPublicKey.current,
        dataKey
      );

      // console.log("Data from SkyDB: ", data);
      // console.log("Revisions to SkyDB: ", revision);

      return data;
    } catch (error) {
      console.log(error);
    }
  };

  // Return the JSON data pertaining to a specific user
  const getUser = async (publicAddress: string) => {
    const data = await getDataFromSkyDB();

    if (Object.keys(data).includes(publicAddress)) {
      return data[publicAddress];
    } else {
      // console.log(
      //   "Error: there is no user with that public address in the database"
      // );
      return null;
    }
  };

  const getUserByUsername = async (username: string) => {
    const data = await getDataFromSkyDB();

    // Get all addresses with given username
    const publicAddresses = Object.keys(data).filter(
      (key) => data[key].username === username
    );

    if (publicAddresses.length) {
      const publicAddress = publicAddresses[0];
      // Return user data and public address
      return {
        ...data[publicAddress],
        publicAddress,
      };
    } else {
      // console.log("Error: there is no user with that username in the database");
    }
  };

  // Onboard a user to the database
  const onboardUser = async (publicAddress: string) => {
    const data = await getDataFromSkyDB();

    // If the public address isn't already in the database, onboard them
    if (!data || !data[publicAddress]) {
      const document = {
        ...data,
        [publicAddress]: {
          transactions: [],
          NFTs: []
        },
      };

      await uploadToSkyDB(document);
    } else {
      // console.log("Error: that public address is already in the database");
    }
  };

  // Update a users fields in DB
  const updateUser = async (
    publicAddress: string,
    updates: Record<string, any>
  ) => {
    const data = await getDataFromSkyDB();

    // If the public address is already in the database, update it
    if (data && data[publicAddress]) {
      const document = {
        ...data,
        [publicAddress]: {
          ...data[publicAddress],
          ...updates,
        },
      };

      await uploadToSkyDB(document);
    } else {
      // console.log("Error: that public addess is not in the database");
    }
  };

  // Add transaction log to DB
  const logTransaction = async (publicAddress: string, hash: any) => {
    const data = await getDataFromSkyDB();

    if (data && data[publicAddress]) {
      const field = data[publicAddress].transactions;
      const logs = field && field.length ? field : [];

      const document = {
        ...data,
        [publicAddress]: {
          ...data[publicAddress],
          transactions: logs.includes(hash) ? [...logs] : [...logs, hash],
        },
      };

      await uploadToSkyDB(document);
    } else {
      // console.log("Error: that public address is not in the database");
    }
  };

  // Add transaction log to DB
  const logContractAddress = async (publicAddress: string, contractAddress: any) => {
    const data = await getDataFromSkyDB();
    // console.log("ZZZ data: ", data)
    // console.log("PADRR: ", publicAddress)
    // console.log("Logging contract")
    if (data != undefined && data[publicAddress] != undefined) {
      const field = data[publicAddress].NFTs;
      const logs = field && field.length ? field : [];

      const document = {
        ...data,
        [publicAddress]: {
          ...data[publicAddress],
          NFTs: [...logs, contractAddress],
        },
      };

      // console.log("New document: ", document)

      await uploadToSkyDB(document);
    } else {
      // console.log("Error: that public address is not in the database");
    }
  };

  return {
    getDataFromSkyDB,
    getUser,
    getUserByUsername,
    onboardUser,
    updateUser,
    logTransaction,
    logContractAddress
  };
}