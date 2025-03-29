import { ClipsDetailContent } from "@/components/features/clips/detail/clips-detail-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default function ClipDetail({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<DataLoading />}>
      <ClipsDetailContent id={params.id} />
    </Suspense>
  );
}
