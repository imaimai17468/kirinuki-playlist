import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Film, UserRound } from "lucide-react";
import Link from "next/link";
import { FollowButton } from "./FollowButton";

interface User {
  id: string;
  name: string;
  iconUrl: string;
  followerCount?: number;
  videoCount?: number;
  playlistCount?: number;
}

interface UsersListProps {
  users: User[];
  emptyMessage?: string;
}

export const UsersList = ({ users, emptyMessage = "No users found" }: UsersListProps) => {
  if (users.length === 0) {
    return <p className="text-center text-muted-foreground my-8">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Link href={`/users/${user.id}`} className="flex items-center space-x-3 hover:opacity-80">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.iconUrl} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </Link>
                <FollowButton userId={user.id} />
              </div>

              {(user.followerCount !== undefined || user.videoCount !== undefined) && (
                <div className="flex items-center gap-3 mt-1">
                  {user.followerCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                      <Badge variant="outline" className="px-2 py-0 h-5 text-xs">
                        {user.followerCount}
                      </Badge>
                    </div>
                  )}

                  {user.videoCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Film className="h-3.5 w-3.5 text-muted-foreground" />
                      <Badge variant="outline" className="px-2 py-0 h-5 text-xs">
                        {user.videoCount}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
