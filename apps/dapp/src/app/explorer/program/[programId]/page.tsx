import { ProgramDetail } from "@/components/explorer/program-detail";

export const metadata = { title: "Program · Explorer" };

export default function Page({ params }: { params: { programId: string } }) {
  return <ProgramDetail programId={decodeURIComponent(params.programId)} />;
}
