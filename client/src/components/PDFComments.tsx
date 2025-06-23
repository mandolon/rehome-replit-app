import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageSquare, Reply } from "lucide-react";

interface User {
  id: string;
  name: string;
  color: string;
}

interface Reply {
  id: string;
  text: string;
  user: User;
  timestamp: Date;
}

interface Comment {
  id: string;
  x: number;
  y: number;
  pageNumber: number;
  text: string;
  user: User;
  replies: Reply[];
  timestamp: Date;
}

interface Pin {
  id: string;
  x: number;
  y: number;
  pageNumber: number;
  user: User;
  number: number;
}

interface PDFCommentsProps {
  isOpen: boolean;
  comments: Comment[];
  pins: Pin[];
  currentPage: number;
  onAddReply: (commentId: string, replyText: string) => void;
}

export default function PDFComments({
  isOpen,
  comments,
  pins,
  currentPage,
  onAddReply
}: PDFCommentsProps) {
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  if (!isOpen) return null;

  const getCurrentPageComments = () => {
    return comments.filter(comment => comment.pageNumber === currentPage);
  };

  const getCurrentPagePins = () => {
    return pins.filter(pin => pin.pageNumber === currentPage);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    
    onAddReply(commentId, replyText);
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 border-l bg-white dark:bg-gray-800 shadow-lg z-10">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Comments</h2>
          <Badge variant="secondary">{comments.length}</Badge>
        </div>
      </div>
      
      <ScrollArea className="h-full p-4">
        {getCurrentPageComments().length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments on this page</p>
            <p className="text-sm mt-2">Click anywhere on the PDF to add a comment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getCurrentPageComments().map((comment, index) => {
              const pinNumber = getCurrentPagePins().find(p => 
                p.x === comment.x && p.y === comment.y
              )?.number || index + 1;
              
              return (
                <Card key={comment.id} className="border-l-4" style={{ borderLeftColor: comment.user.color }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: comment.user.color }}
                      >
                        {pinNumber}
                      </div>
                      <CardTitle className="text-sm">{comment.user.name}</CardTitle>
                      <span className="text-xs text-gray-500 ml-auto">
                        Page {comment.pageNumber}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm mb-2">{comment.text}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {formatTimestamp(comment.timestamp)}
                    </p>
                    
                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <Separator />
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="ml-4 pl-3 border-l-2 border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">{reply.user.name}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(reply.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply input */}
                    {replyingTo === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            Reply
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(comment.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Reply className="h-3 w-3" />
                        Reply
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}