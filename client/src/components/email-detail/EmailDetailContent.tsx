
import React from 'react';

interface EmailDetailContentProps {
  content: string;
}

const EmailDetailContent = ({ content }: EmailDetailContentProps) => {
  return (
    <div 
      className="text-sm text-foreground leading-relaxed [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:ml-6 [&>ul]:list-disc [&>li]:mb-1"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default EmailDetailContent;
