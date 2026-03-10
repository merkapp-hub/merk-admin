import { useEffect, useState } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await Api("get", "getSellerNotifications?limit=1", "", router);
      if (res.status) {
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <span className="bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}
