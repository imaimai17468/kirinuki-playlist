import { FollowingContent } from "@/components/features/users/following/following-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default function Following({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<DataLoading />}>
      <FollowingContent id={params.id} />
    </Suspense>
  );
}
