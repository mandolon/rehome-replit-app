import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageSquare, Reply, Edit2, Trash2, Check, X } from "lucide-react";

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
  onEditComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
  onHighlightComment: (commentId: string) => void;
  highlightedComment: string | null;
}

export default function PDFComments({
  isOpen,
  comments,
  pins,
  currentPage,
  onAddReply,
  onEditComment,
  onDeleteComment,
  onHighlightComment,
  highlightedComment
}: PDFCommentsProps) {
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingComment && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [editingComment]);

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

  const startEditingComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const saveEditComment = () => {
    if (!editingComment || !editText.trim()) return;
    
    onEditComment(editingComment, editText);
    setEditingComment(null);
    setEditText("");
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditText("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditComment();
    } else if (e.key === 'Escape') {
      cancelEditComment();
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (editingComment && !e.currentTarget.contains(e.target as Node)) {
      cancelEditComment();
    }
  };

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 border-l bg-white dark:bg-gray-800 shadow-lg z-10">
      <div className="p-2 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h2 className="text-sm font-semibold">Comments</h2>
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{comments.length}</Badge>
        </div>
      </div>
      
      <ScrollArea className="h-full p-2">
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
                <Card 
                  key={comment.id} 
                  className={`border-l-4 cursor-pointer transition-all ${
                    highlightedComment === comment.id ? 'bg-blue-50 dark:bg-blue-900/20 shadow-md' : ''
                  }`} 
                  style={{ borderLeftColor: comment.user.color }}
                  onClick={() => onHighlightComment(comment.id)}
                >
                  <CardHeader className="pb-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                        style={{ backgroundColor: comment.user.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onHighlightComment(comment.id);
                        }}
                      >
                        {pinNumber}
                      </div>
                      <CardTitle className="text-xs">{comment.user.name}</CardTitle>
                      <span className="text-xs text-gray-500 ml-auto">
                        Page {comment.pageNumber}
                      </span>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingComment(comment);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteComment(comment.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 pb-2">
                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          ref={editTextareaRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="min-h-[60px] text-xs"
                          placeholder="Edit comment..."
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={saveEditComment}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={cancelEditComment}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs mb-1">{comment.text}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatTimestamp(comment.timestamp)}
                        </p>
                      </>
                    )}
                    
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