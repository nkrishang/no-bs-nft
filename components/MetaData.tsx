  
import Head from "next/head";

const TITLE = "No bullshit NFTs";
const DESCRIPTION = "Mint an individual NFT or a collection without the extra platform bullshit.";
const URL = "https://nobullshitnft.com";
const IMAGE = ``;

interface MetaDataProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export const MetaData: React.FC<MetaDataProps> = ({
  title = TITLE,
  description = DESCRIPTION,
  url = URL,
  image = IMAGE,
}) => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="Highlight" />
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:site" content="@NoBullshitNFT" />
      <meta property="twitter:card" content="summary" />
    </Head>
  );
};