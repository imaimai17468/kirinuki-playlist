import { Loader2 } from "lucide-react";

export const DataLoading = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 bg-white rounded-full" />
        </div>
      </div>
      <h2 className="text-gray-700 text-xl font-medium mt-6 mb-2">読み込み中</h2>
      <p className="text-gray-500 text-center">データを取得しています...</p>

      <div className="mt-8 flex justify-center space-x-2">
        <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};
