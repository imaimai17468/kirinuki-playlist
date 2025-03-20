import { getAllAuthors, getAuthorById } from "@/repositories/author";
import { useQuery } from "@tanstack/react-query";

// 著者一覧を取得するフック
export function useAuthors() {
  return useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const result = await getAllAuthors();
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
  });
}

// 特定の著者を取得するフック
export function useAuthor(id: string) {
  return useQuery({
    queryKey: ["authors", id],
    queryFn: async () => {
      const result = await getAuthorById(id);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    // IDが指定されていない場合はクエリを実行しない
    enabled: !!id,
  });
}
