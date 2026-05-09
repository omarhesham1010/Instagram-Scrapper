import { Heart, Repeat, PlaySquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const mockActivities = [
  {
    id: 1,
    user: "Ahmed",
    avatar: "https://i.pravatar.cc/150?u=1",
    type: "like",
    content: "Reel by @design_tips",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: 2,
    user: "Sara",
    avatar: "https://i.pravatar.cc/150?u=2",
    type: "repost",
    content: "Post by @startup_quotes",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
  },
  {
    id: 3,
    user: "Omar",
    avatar: "https://i.pravatar.cc/150?u=3",
    type: "watch",
    content: "Video by @tech_insider",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 4,
    user: "Nour",
    avatar: "https://i.pravatar.cc/150?u=4",
    type: "like",
    content: "Reel by @funny_cats",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "like": return <Heart className="w-4 h-4 text-rose-500" />;
    case "repost": return <Repeat className="w-4 h-4 text-green-500" />;
    case "watch": return <PlaySquare className="w-4 h-4 text-blue-500" />;
    default: return null;
  }
};

export function RecentActivity() {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10">
            <div className="relative">
              <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full border border-white/10" />
              <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-[var(--glass-border)]">
                {getIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200">
                <span className="font-semibold text-white">{activity.user}</span>{" "}
                {activity.type === "like" ? "liked a" : activity.type === "repost" ? "reposted a" : "watched a"}{" "}
                <span className="font-medium text-gray-300">{activity.content}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-sm text-[#e1306c] hover:text-white transition-colors font-medium border border-white/5 rounded-lg hover:bg-[#e1306c]/10">
        View All Activity
      </button>
    </div>
  );
}
