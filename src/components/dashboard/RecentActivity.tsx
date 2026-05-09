import { Heart, Repeat, PlaySquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";

const getIcon = (type: string) => {
  switch (type) {
    case "like": return <Heart className="w-4 h-4 text-rose-500" />;
    case "repost": return <Repeat className="w-4 h-4 text-green-500" />;
    case "watch": return <PlaySquare className="w-4 h-4 text-blue-500" />;
    default: return null;
  }
};

export function RecentActivity() {
  const recentActivities = useLiveQuery(
    () => db.activities.orderBy("timestamp").reverse().limit(10).toArray()
  );

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {recentActivities?.map((activity) => (
          <Link href={`/friends/${activity.friendId}`} key={activity.id}>
            <div className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10 mb-2">
              <div className="relative">
                <img src={activity.authorAvatar} alt={activity.authorUsername} className="w-10 h-10 rounded-full border border-white/10" />
                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-[var(--glass-border)]">
                  {getIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">
                  <span className="font-semibold text-white">{activity.authorUsername}</span>{" "}
                  {activity.type === "like" ? "liked" : activity.type === "repost" ? "reposted" : "watched"}
                  <span className="font-medium text-gray-300 ml-1">content</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {recentActivities?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No recent activity found.</p>
        )}
      </div>
      <Link href="/activity" className="w-full mt-4 py-2 text-sm text-[#e1306c] hover:text-white transition-colors font-medium border border-white/5 rounded-lg hover:bg-[#e1306c]/10 text-center block">
        View All Activity
      </Link>
    </div>
  );
}
