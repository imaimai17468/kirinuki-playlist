import { TriangleAlertIcon } from "lucide-react";

export const DataError = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-red-50 rounded-full p-5 mb-6">
        <TriangleAlertIcon className="h-12 w-12 text-red-400" />
      </div>
      <h2 className="text-gray-800 text-2xl font-bold mb-3">データが見つかりませんでした</h2>
      <p className="text-gray-500 text-center">申し訳ありませんが、リクエストされたデータは読み込めませんでした。</p>
      <p className="text-gray-500 text-center">後ほど再度お試しください。</p>
    </div>
  );
};
