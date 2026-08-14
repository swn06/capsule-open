import { CapsuleView } from "@/components/capsule-view";

export default async function CapsulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CapsuleView capsuleId={id} />;
}
