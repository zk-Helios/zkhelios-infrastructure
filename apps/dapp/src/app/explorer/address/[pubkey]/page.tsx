import { AddressDetail } from "@/components/explorer/address-detail";

export const metadata = { title: "Address · Explorer" };

export default function Page({ params }: { params: { pubkey: string } }) {
  return <AddressDetail pubkey={decodeURIComponent(params.pubkey)} />;
}
