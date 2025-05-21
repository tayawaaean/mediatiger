import * as React from "react";
import { cn } from "../../lib/utils";

interface NotificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  maxCount?: number;
  showZero?: boolean;
}

export function NotificationBadge({
  count = 0,
  maxCount = 99,
  showZero = false,
  className,
  ...props
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div
      className={cn(
        "flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-1.5 text-xs font-medium text-white shadow-sm shadow-indigo-900/20",
        className
      )}
      {...props}
    >
      {displayCount}
    </div>
  );
}