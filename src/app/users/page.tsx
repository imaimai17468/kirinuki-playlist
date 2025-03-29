import { UsersContent } from "@/components/features/users/users-content";
import { DataLoading } from "@/components/parts/data-loading";
import { Suspense } from "react";

export default async function Users() {
  return (
    <Suspense fallback={<DataLoading />}>
      <UsersContent />
    </Suspense>
  );
}
