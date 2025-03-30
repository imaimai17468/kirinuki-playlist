import { ClipsContent } from "@/components/features/clips/clips-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default async function Clips() {
  return (
    <div>
      <Suspense fallback={<DataLoading />}>
        <ClipsContent />
      </Suspense>
    </div>
  );
}
