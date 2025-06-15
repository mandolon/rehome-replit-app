import React, { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import TaskChatInput from './TaskChatInput';
import { fetchTaskMessages, insertTaskMessage, subscribeToTaskMessages, TaskMessage } from '@/data/taskMessagesSupabase';
import { supabase } from "@/integrations/supabase/client";
import { getCRMUser } from '@/utils/taskUserCRM';

interface TaskDetailActivityProps {
  taskId?: string;
}

const TaskDetailActivity = ({ taskId }: TaskDetailActivityProps) => {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Util to get initials if needed
  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }

  function getRelativeTime(dateIso: string) {
    const date = new Date(dateIso);
    const now = new Date();
    const diffMillis = now.getTime() - date.getTime();
    if (diffMillis < 60 * 1000) return 'Just now';
    if (diffMillis < 60 * 60 * 1000) return `${Math.floor(diffMillis / (60 * 1000))}m ago`;
    if (diffMillis < 24 * 60 * 60 * 1000) return `${Math.floor(diffMillis / (60 * 60 * 1000))}h ago`;
    return date.toLocaleDateString();
  }

  // Find the CRM user by user_id or user_name, and always expose both avatar & full name
  function lookupChatUser(msg: TaskMessage) {
    const crmUser = getCRMUser({
      id: msg.user_id, // try to match by id (for internal users)
      name: msg.user_name, // fallback to name
      avatar: undefined,
      fullName: undefined,
    });
    if (crmUser) {
      return {
        avatar: crmUser.avatar ?? getInitials(msg.user_name),
        avatarColor: crmUser.avatarColor ?? 'bg-gray-400',
        fullName: crmUser.fullName ?? msg.user_name,
      };
    }
    // Fallback for unknown user
    return {
      avatar: getInitials(msg.user_name),
      avatarColor: 'bg-gray-400',
      fullName: msg.user_name
    };
  }

  // Fetch messages from Supabase
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    if (!taskId) return;
    fetchTaskMessages(taskId)
      .then(msgs => { if (mounted) setMessages(msgs); })
      .catch(err => { if (mounted) setError('Could not load messages.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [taskId]);

  // Subscribe to realtime message updates
  useEffect(() => {
    if (!taskId) return;
    const channel = subscribeToTaskMessages(taskId, (msg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSendMessageInput(value: string) {
    if (!value.trim() || !currentUser || !taskId) return;
    try {
      await insertTaskMessage(taskId, currentUser.id, currentUser.name, value.trim());
    } catch (e) {
      setError('Failed to send message.');
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Activity Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Activity</h3>
      </div>

      {/* Message List */}
      <div ref={messageListRef} className="flex-1 overflow-y-auto p-3 space-y-6 max-h-full">
        {loading && <div>Loading messages...</div>}
        {error && <div className="text-red-500 text-xs">{error}</div>}
        {!loading && !error && messages.map((msg) => {
          const isSelf = msg.user_id === currentUser?.id;
          const chatUser = lookupChatUser(msg);

          return (
            <div key={msg.id} className="space-y-2">
              <div className={`flex gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                {!isSelf && (
                  <>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={`${chatUser.avatarColor} text-white text-xs font-medium`}>
                        {chatUser.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
                <div className={`max-w-xs ${isSelf ? 'order-first' : ''}`}>
                  {/* Always show full name for ALL users */}
                  <div className="text-xs font-medium mb-1">{chatUser.fullName}</div>
                  <div className={`p-2 rounded-lg text-xs break-words ${
                    isSelf
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-muted'
                  }`}>
                    {msg.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{getRelativeTime(msg.created_at)}</div>
                </div>
                {isSelf && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={`${chatUser.avatarColor} text-white text-xs font-medium`}>
                      {chatUser.avatar}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Message Input */}
      <TaskChatInput onSendMessage={handleSendMessageInput} disabled={!currentUser || !taskId} />
    </div>
  );
};

export default TaskDetailActivity;
