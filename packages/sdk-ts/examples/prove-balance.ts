import { ZkHelios } from "@zkhelios/sdk";

/** Minimal end-to-end example: prove a balance threshold and submit on-chain. */
async function main() {
  const zk = new ZkHelios({ cluster: "devnet" /* wallet: yourWallet */ });

  const proof = await zk.proveBalance({ token: "SOL", min: 100, balance: 243.5 });
  const { signature, proofAccount } = await zk.submitProof(proof);

  console.log("submitted:", signature);
  console.log("proof account:", proofAccount);
}

main().catch(console.error);
