import { FollowButton } from "@/components/features/users/commons/FollowButton";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CLIENT_PATH } from "@/consts/clientpath";
import { getAuthorById } from "@/repositories/authors";
import { getUserFollowers, getUserFollowing } from "@/repositories/follows";
import Link from "next/link";

type Props = {
  id: string;
};

export const UserDetailContent = async ({ id }: Props) => {
  const [authorResult, followersResult, followingResult] = await Promise.all([
    getAuthorById(id),
    getUserFollowers(id),
    getUserFollowing(id),
  ]);

  if (authorResult.isErr()) {
    return <DataError />;
  }

  const author = authorResult.value;
  const followers = followersResult.isOk() ? followersResult.value : [];
  const following = followingResult.isOk() ? followingResult.value : [];

  return (
    <ContentLayout endItem={{ id: id as string, label: author.name }}>
      <div className="flex flex-col gap-8">
        {/* 一覧に戻るリンク */}
        <BackLink href={CLIENT_PATH.USERS} text="Back to Users" />

        {/* プロフィール情報 */}
        <div className="flex flex-col gap-4">
          {/* ヘッダー: アバター、名前、フォローボタンを横並びに */}
          <div className="flex items-center gap-8">
            {/* アバター */}
            <div className="flex flex-col items-center gap-1">
              <Avatar className="h-16 w-16 md:h-24 md:w-24">
                <AvatarImage src={author.iconUrl || ""} alt={author.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl md:text-3xl">
                  {author.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 名前とフォローボタン */}
            <div className="flex items-center gap-8">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{author.name}</h1>
              <FollowButton userId={id} className="px-3" />
            </div>
          </div>

          {/* フォロワー数 */}
          <div className="flex items-center gap-4">
            <Link
              href={`/users/${id}/followers`}
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="font-bold">{followers.length}</span>
              <span className="ml-1">Followers</span>
            </Link>

            <Link
              href={`/users/${id}/following`}
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="font-bold">{following.length}</span>
              <span className="ml-1">Following</span>
            </Link>
          </div>

          {/* Bio */}
          {author.bio && <p className="text-sm text-muted-foreground">{author.bio}</p>}
        </div>

        <Separator />

        {/* 詳細情報 */}
        <Card>
          <CardHeader className="text-sm font-medium">コンテンツ情報</CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">今後、プレイリスト数やクリップ数などの統計情報を表示予定</p>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};
