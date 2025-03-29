import { UserDetailContent } from "@/components/features/users/detail/user-detail-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default function UserDetail({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<DataLoading />}>
      <UserDetailContent id={params.id} />
    </Suspense>
  );
}
