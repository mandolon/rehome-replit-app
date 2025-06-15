
import { supabase } from "@/integrations/supabase/client";

export interface TaskMessage {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export async function fetchTaskMessages(taskId: string): Promise<TaskMessage[]> {
  const { data, error } = await supabase
    .from('task_messages')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as TaskMessage[];
}

export async function insertTaskMessage(taskId: string, userId: string, userName: string, message: string): Promise<TaskMessage> {
  const { data, error } = await supabase
    .from('task_messages')
    .insert([{
      task_id: taskId,
      user_id: userId,
      user_name: userName,
      message,
    }])
    .select('*')
    .single();
  if (error) throw error;
  return data as TaskMessage;
}

export function subscribeToTaskMessages(taskId: string, callback: (msg: TaskMessage, eventType: string) => void) {
  const channel = supabase
    .channel(`public-task_messages-${taskId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'task_messages',
      filter: `task_id=eq.${taskId}`,
    }, (payload: any) => {
      if (payload.eventType === 'INSERT') callback(payload.new, 'INSERT');
    })
    .subscribe();
  return channel;
}
