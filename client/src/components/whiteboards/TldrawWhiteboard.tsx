import React from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

interface TldrawWhiteboardProps {
  whiteboardId?: string;
}

const TldrawWhiteboard: React.FC<TldrawWhiteboardProps> = ({ whiteboardId }) => {
  return (
    <div className="h-full w-full">
      <Tldraw
        persistenceKey={whiteboardId || 'default-whiteboard'}
        onMount={(editor) => {
          // Optional: Configure editor on mount
          console.log('Tldraw editor mounted');
        }}
      />
    </div>
  );
};

export default TldrawWhiteboard;
