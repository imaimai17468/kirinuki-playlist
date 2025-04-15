import { ClipCard } from "@/components/features/clips/commons/clip-card";
import { FollowButton } from "@/components/features/users/commons/FollowButton";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { EmptyState } from "@/components/parts/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CLIENT_PATH } from "@/consts/clientpath";
import { getAuthorWithVideos } from "@/repositories/authors";
import { getUserFollowers, getUserFollowing } from "@/repositories/follows";
import Link from "next/link";

type Props = {
  id: string;
};

export const UserDetailContent = async ({ id }: Props) => {
  const [authorResult, followersResult, followingResult] = await Promise.all([
    getAuthorWithVideos(id),
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
    <ContentLayout customItems={[{ id: id as string, label: author.name, position: 0 }]}>
      <div className="flex flex-col gap-8">
        {/* 一覧に戻るリンク */}
        <BackLink href={CLIENT_PATH.USERS} text="Back to Users" />

        {/* プロフィール情報 - シンプルなデザイン */}
        <div className="w-full max-w-md mx-auto p-6">
          <div className="flex flex-col items-center space-y-5">
            {/* アバター */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={author.iconUrl || ""} alt={author.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* 名前 */}
            <div className="text-center">
              <h2 className="text-2xl font-bold">{author.name}</h2>
              <p className="text-xs text-muted-foreground">@{author.id.substring(0, 8)}</p>
            </div>

            {/* フォロー/フォロワー数 */}
            <div className="flex gap-8 text-sm">
              <Link href={`/users/${id}/following`} className="text-center hover:text-primary transition-colors">
                <p className="font-medium">{following.length}</p>
                <p className="text-xs text-muted-foreground">フォロー</p>
              </Link>
              <Link href={`/users/${id}/followers`} className="text-center hover:text-primary transition-colors">
                <p className="font-medium">{followers.length}</p>
                <p className="text-xs text-muted-foreground">フォロワー</p>
              </Link>
            </div>

            {/* Bio */}
            {author.bio && <p className="text-sm text-center text-muted-foreground">{author.bio}</p>}

            {/* フォローボタン */}
            <FollowButton userId={id} className="w-full max-w-[200px]" />
          </div>
        </div>

        <Separator />

        {/* 動画一覧 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">投稿動画</h2>

          {author.videos && author.videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {author.videos.map((video) => (
                <ClipCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState title="動画がありません" description="このユーザーはまだ動画を投稿していません" />
          )}
        </div>

        <Separator />

        {/* 詳細情報 */}
        <Card>
          <CardHeader className="text-sm font-medium">Content information</CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We will display statistical information such as the number of playlists and clips in the future.
            </p>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};
