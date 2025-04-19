import { BookmarksContent } from "@/components/features/bookmarks/bookmarks-content";
import { DataLoading } from "@/components/parts/data-loading";
import { getAuth } from "@/repositories/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page() {
  // 認証情報を取得
  const { userId } = await getAuth();

  // 認証されていない場合はログイン必須ページにリダイレクト
  if (!userId) {
    redirect("/login-required");
  }

  return (
    <div>
      <Suspense fallback={<DataLoading />}>
        <BookmarksContent authorId={userId} />
      </Suspense>
    </div>
  );
}
