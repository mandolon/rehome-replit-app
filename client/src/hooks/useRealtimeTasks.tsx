import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeTasks() {
  const queryClient = useQueryClient();

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      
      switch (message.event) {
        case 'task_created':
        case 'task_updated':
        case 'task_deleted':
        case 'task_restored':
        case 'message_created':
          // Invalidate and refetch tasks when any task-related event occurs
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['work-records'] });
          break;
        
        default:
          console.log('Unknown WebSocket event:', message.event);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [queryClient]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected for real-time updates');
    };
    
    ws.onmessage = handleWebSocketMessage;
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [handleWebSocketMessage]);

  return {};
}