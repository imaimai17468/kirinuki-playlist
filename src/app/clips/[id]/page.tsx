import { ClipDetailContent } from "@/components/features/clips/detail/clip-detail-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default function ClipDetail({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<DataLoading />}>
      <ClipDetailContent id={params.id} />
    </Suspense>
  );
}
