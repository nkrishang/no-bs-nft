import { parseSkylink, SkynetClient } from "skynet-js";

interface NFTMetadata {
  name: string;
  description: string;
  image: string
}
/// Uploads metadata json to skynet
export const uploadMetadataToSkynet = async (metadata: NFTMetadata) => {

  const portal = "https://siasky.net/";
  const skyportal = new SkynetClient(portal);

  const blob: BlobPart = new Blob([JSON.stringify(metadata)], {
    type: "application/json",
  });

  const metadataFile = new File([blob], "example.json");

  try {
    const { skylink } = await skyportal.uploadFile(metadataFile);
    const parsedSkylink: string | null = parseSkylink(skylink);
      
    console.log("Metadata Skylink: ", skylink);

    return portal + parsedSkylink;
  } catch (err) {
    console.log(err);
  }
}