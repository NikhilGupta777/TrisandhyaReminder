import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Loader2, BellRing, ExternalLink } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow, format } from "date-fns";
import { useNotifications, useNotificationSound } from "@/hooks/use-notifications";

interface NotificationData {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    targetUrl: string | null;
    createdAt: Date;
  };
  receipt: {
    id: string;
    isRead: boolean;
    readAt: Date | null;
    deliveredAt: Date;
  };
}

interface NotificationBellProps {
  userId?: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const { permission, requestPermission } = useNotifications(userId);
  const { playNotificationSound } = useNotificationSound();

  const { data: unreadCount, isLoading: countLoading } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<NotificationData[]>({
    queryKey: ["/api/notifications"],
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest("POST", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unread = unreadCount?.count || 0;
  const hasUnread = unread > 0;

  return (
    <>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" data-testid="popover-notifications">
        {permission === 'default' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border-b border-border">
            <div className="flex items-start gap-2">
              <BellRing className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Enable notifications to receive updates even when the app is closed
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto p-0 text-blue-600 dark:text-blue-400"
                  onClick={requestPermission}
                  data-testid="button-enable-notifications"
                >
                  Enable now
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-border">
          <h3 className="font-semibold text-foreground dark:text-foreground">Notifications</h3>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all
                </>
              )}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notificationsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border dark:divide-border">
              {notifications.map(({ notification, receipt }) => (
                <div
                  key={receipt.id}
                  className={`p-4 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors cursor-pointer ${
                    !receipt.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                  onClick={() => {
                    if (!receipt.isRead) {
                      markAsReadMutation.mutate(notification.id);
                    }
                    setSelectedNotification({ notification, receipt });
                  }}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground dark:text-foreground">
                          {notification.title}
                        </p>
                        {!receipt.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!receipt.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                        disabled={markAsReadMutation.isPending}
                        data-testid={`button-mark-read-${notification.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>

    <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
      <DialogContent className="max-w-2xl" data-testid="dialog-notification-preview">
        {selectedNotification && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedNotification.notification.title}
                {!selectedNotification.receipt.isRead && (
                  <Badge variant="default" className="ml-auto">New</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {format(new Date(selectedNotification.notification.createdAt), "PPpp")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedNotification.notification.message}
                </p>
              </div>

              {selectedNotification.notification.targetUrl && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      window.location.href = selectedNotification.notification.targetUrl!;
                    }}
                    className="w-full"
                    data-testid="button-notification-link"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Related Page
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t">
                <span>Type: {selectedNotification.notification.type}</span>
                {selectedNotification.receipt.readAt && (
                  <span>Read: {formatDistanceToNow(new Date(selectedNotification.receipt.readAt), { addSuffix: true })}</span>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
