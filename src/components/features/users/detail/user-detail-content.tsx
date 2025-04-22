import { ClipCard } from "@/components/features/clips/commons/clip-card";
import { PlaylistCard } from "@/components/features/playlists/commons/playlist-card";
import { FollowButton } from "@/components/features/users/commons/FollowButton";
import { ContentLayout } from "@/components/layout/content-layout";
import { BackLink } from "@/components/parts/back-link";
import { DataError } from "@/components/parts/data-error";
import { EmptyState } from "@/components/parts/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLIENT_PATH } from "@/consts/clientpath";
import { getAuthorWithVideosAndPlaylists } from "@/repositories/authors";
import { getUserFollowers, getUserFollowing } from "@/repositories/follows";
import Link from "next/link";

type Props = {
  id: string;
};

export const UserDetailContent = async ({ id }: Props) => {
  const [authorResult, followersResult, followingResult] = await Promise.all([
    getAuthorWithVideosAndPlaylists(id),
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
        {/* Back to list link */}
        <BackLink href={CLIENT_PATH.USERS} text="Back to Users" />

        {/* Profile information - Simple design */}
        <div className="w-full max-w-md mx-auto p-6">
          <div className="flex flex-col items-center space-y-5">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={author.iconUrl || ""} alt={author.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <div className="text-center">
              <h1 className="text-3xl font-bold">{author.name}</h1>
              <p className="text-xs text-muted-foreground">@{author.id.substring(0, 8)}</p>
            </div>

            {/* Follow/Followers count */}
            <div className="flex gap-8 text-sm">
              <Link href={`/users/${id}/following`} className="text-center hover:text-primary transition-colors">
                <p className="font-medium">{following.length}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </Link>
              <Link href={`/users/${id}/followers`} className="text-center hover:text-primary transition-colors">
                <p className="font-medium">{followers.length}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </Link>
            </div>

            {/* Bio */}
            {author.bio && <p className="text-sm text-center text-muted-foreground">{author.bio}</p>}

            {/* Follow button */}
            <FollowButton userId={id} userName={author.name} className="w-full max-w-[200px]" />
          </div>
        </div>

        <Separator />

        {/* Tabbed content - Videos and Playlists */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>

          {/* Videos tab */}
          <TabsContent value="videos" className="mt-0">
            <div className="flex flex-col gap-4">
              {author.videos && author.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {author.videos.map((video) => (
                    <ClipCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No Videos" description="This user has not posted any videos yet" />
              )}
            </div>
          </TabsContent>

          {/* Playlists tab */}
          <TabsContent value="playlists" className="mt-0">
            <div className="flex flex-col gap-4">
              {author.playlists && author.playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {author.playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No Playlists" description="This user has not created any playlists yet" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};
