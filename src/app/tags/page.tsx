import { TagsContent } from "@/components/features/tags/tags-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default async function Tags() {
  return (
    <div>
      <Suspense fallback={<DataLoading />}>
        <TagsContent />
      </Suspense>
    </div>
  );
}
