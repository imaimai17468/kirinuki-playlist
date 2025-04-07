import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FollowButton } from "./FollowButton";

interface User {
  id: string;
  name: string;
  iconUrl: string;
}

interface UsersListProps {
  users: User[];
  emptyMessage?: string;
}

export const UsersList = ({ users, emptyMessage = "ユーザーが見つかりません" }: UsersListProps) => {
  if (users.length === 0) {
    return <p className="text-center text-muted-foreground my-8">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
