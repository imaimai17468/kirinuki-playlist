import { FollowersContent } from "@/components/features/users/followers/followers-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default function Followers({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<DataLoading />}>
      <FollowersContent id={params.id} />
    </Suspense>
  );
}
