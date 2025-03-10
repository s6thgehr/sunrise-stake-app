import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import * as fs from "fs";
import os from "os";
import { AnchorProvider } from "@project-serum/anchor";

const name = "Sunrise gSOL";
const description = "Sunrise Stake Green SOL Token";
const symbol = "GSOL";
const imageFile = "gSOL.png";

const keypair = Keypair.fromSecretKey(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Buffer.from(require(os.homedir() + "/.config/solana/id.json"))
);

export const provider = AnchorProvider.env();

export const metaplex = Metaplex.make(provider.connection)
  .use(keypairIdentity(keypair))
  .use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
    })
  );

export const getMetadataAddress = (mint: PublicKey): PublicKey =>
  anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];

// Upload image and get image uri
const buffer = fs.readFileSync("packages/app/public/" + imageFile);
export const file = toMetaplexFile(buffer, imageFile);

export const uploadMetadata = async (): Promise<string> => {
  const image = await metaplex.storage().upload(file);
  console.log("image uri: ", image);

  // Upload metadata and get metadata uri
  const { uri } = await metaplex.nfts().uploadMetadata({
    ...metadata,
    image,
  });
  console.log("metadata uri:", uri);
  return uri;
};

export const metadata = {
  name,
  description,
  symbol,
};
