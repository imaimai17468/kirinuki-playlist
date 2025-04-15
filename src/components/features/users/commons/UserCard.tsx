import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDetailPath } from "@/consts/clientpath";
import { formatDate } from "@/utils/date";
import { CalendarDays, Film, PlaySquare, Users } from "lucide-react";
import Link from "next/link";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    iconUrl: string;
    createdAt?: Date;
    bio?: string | null;
    followerCount?: number;
    videoCount?: number;
    playlistCount?: number;
  };
  showDetailButton?: boolean;
}

export const UserCard = ({ user, showDetailButton = true }: UserCardProps) => {
  // フォロワー数を読みやすい形式に変換
  const formatNumber = (num = 0) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}千`;
    }
    return num.toString();
  };

  return (
    <Card className="overflow-hidden hover:bg-muted/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <Link
            href={getDetailPath("USER_DETAIL", user.id)}
            className="relative w-20 h-20 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-full h-full">
              <AvatarImage src={user.iconUrl || ""} alt={user.name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <Link href={getDetailPath("USER_DETAIL", user.id)} className="hover:text-primary transition-colors">
                <h2 className="text-xl font-bold">{user.name}</h2>
              </Link>
              {user.createdAt && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>{formatDate(user.createdAt)}から配信中</span>
                </div>
              )}
            </div>

            {user.bio && <p className="text-sm mb-3 line-clamp-2">{user.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.videoCount !== undefined && (
                <div className="flex items-center">
                  <Film className="h-4 w-4 mr-1" />
                  <span>動画 {user.videoCount}本</span>
                </div>
              )}
              {user.playlistCount !== undefined && (
                <div className="flex items-center">
                  <PlaySquare className="h-4 w-4 mr-1" />
                  <span>プレイリスト {user.playlistCount}個</span>
                </div>
              )}
              {user.followerCount !== undefined && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>フォロワー {formatNumber(user.followerCount)}</span>
                </div>
              )}
            </div>
          </div>

          {showDetailButton && (
            <Button asChild className="flex-shrink-0">
              <Link href={getDetailPath("USER_DETAIL", user.id)}>詳細</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
