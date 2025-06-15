import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Check } from 'lucide-react';

interface ToDoItem {
  id: number;
  text: string;
  completed: boolean;
  dateCreated: string;
}

const ToDoTab = () => {
  const [todos, setTodos] = useState<ToDoItem[]>([
    {
      id: 1,
      text: 'Review project specifications',
      completed: false,
      dateCreated: '12/10/24'
    },
    {
      id: 2,
      text: 'Schedule team meeting',
      completed: true,
      dateCreated: '12/09/24'
    },
    {
      id: 3,
      text: 'Update project timeline',
      completed: false,
      dateCreated: '12/08/24'
    }
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: ToDoItem = {
        id: Math.max(...todos.map(t => t.id), 0) + 1,
        text: newTodoText.trim(),
        completed: false,
        dateCreated: new Date().toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: '2-digit' 
        })
      };
      setTodos([newTodo, ...todos]);
      setNewTodoText('');
    }
  };

  const handleToggleComplete = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Add New Todo */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleAddTodo} className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="w-4 h-4" strokeWidth="2" />
        </Button>
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-1.5 border-b">
              <div className="col-span-1">Status</div>
              <div className="col-span-7">Task</div>
              <div className="col-span-3">Date Created</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            {/* Todo Rows */}
            {todos.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No tasks found
              </div>
            ) : (
              todos.map((todo) => (
                <div key={todo.id} className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30">
                  <div className="col-span-1 flex items-center">
                    <button
                      onClick={() => handleToggleComplete(todo.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {todo.completed && <Check className="w-2.5 h-2.5" strokeWidth="2" />}
                    </button>
                  </div>
                  <div className={`col-span-7 ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {todo.text}
                  </div>
                  <div className="col-span-3 text-muted-foreground">{todo.dateCreated}</div>
                  <div className="col-span-1 flex items-center">
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth="2" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Total: {todos.length}</span>
        <span>Completed: {todos.filter(t => t.completed).length}</span>
        <span>Pending: {todos.filter(t => !t.completed).length}</span>
      </div>
    </div>
  );
};

export default ToDoTab;
