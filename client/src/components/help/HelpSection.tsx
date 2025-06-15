
import React from "react";

interface HelpSectionProps {
  title: string;
  children: React.ReactNode;
}
const HelpSection: React.FC<HelpSectionProps> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <div className="text-muted-foreground text-sm">{children}</div>
  </section>
);

export default HelpSection;
