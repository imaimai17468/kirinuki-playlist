import { TagDetailContent } from "@/components/features/tags/detail/tag-detail-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

interface TagDetailParams {
  params: {
    id: string;
  };
}

export default async function TagDetail({ params }: TagDetailParams) {
  const { id } = params;

  return (
    <div>
      <Suspense fallback={<DataLoading />}>
        <TagDetailContent id={id} />
      </Suspense>
    </div>
  );
}
