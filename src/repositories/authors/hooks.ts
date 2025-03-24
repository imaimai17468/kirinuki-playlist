import { createAuthor, deleteAuthor, getAllAuthors, getAuthorById, updateAuthor } from "@/repositories/authors";
import type { AuthorInsert, AuthorUpdate } from "@/repositories/authors/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

// 著者を作成するフック
export function useCreateAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AuthorInsert) => {
      const result = await createAuthor(data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 作成成功後に著者一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

// 著者を更新するフック
export function useUpdateAuthor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AuthorUpdate) => {
      const result = await updateAuthor(id, data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 更新成功後に該当著者と著者一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["authors", id] });
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

// 著者を削除するフック
export function useDeleteAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteAuthor(id);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 削除成功後に著者一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}
