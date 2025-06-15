import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TaskDetailDescriptionProps {
  value: string | undefined;
  onSave?: (value: string) => void;
  disabled?: boolean;
}

const TaskDetailDescription: React.FC<TaskDetailDescriptionProps> = ({
  value,
  onSave,
  disabled,
}) => {
  const [desc, setDesc] = useState(value ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValue = useRef(value ?? "");

  // For animation: fade out after save
  const [showSaving, setShowSaving] = useState(false);
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when new task is loaded or prop changes
  useEffect(() => {
    setDesc(value ?? "");
    setDirty(false);
    setSaving(false);
    lastSavedValue.current = value ?? "";
  }, [value]);

  // Debounced autosave when user stops typing
  useEffect(() => {
    if (!dirty) return;
    if (!onSave) return;
    if (desc === lastSavedValue.current) {
      setDirty(false);
      setSaving(false);
      return;
    }
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      setShowSaving(true);
      try {
        await Promise.resolve(onSave(desc));
        lastSavedValue.current = desc;
      } finally {
        setSaving(false);
        // Show Auto-save a bit longer (1500ms) after save finishes
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        fadeTimeout.current = setTimeout(() => setShowSaving(false), 1500);
        setDirty(false);
      }
    }, 1800); // Save after 1.8 seconds inactivity
    // cleanup 
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [desc, dirty, onSave]);

  // Immediate save on blur
  const handleBlur = async () => {
    if (
      dirty &&
      onSave &&
      desc !== lastSavedValue.current
    ) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      setSaving(true);
      setShowSaving(true);
      try {
        await Promise.resolve(onSave(desc));
        lastSavedValue.current = desc;
      } finally {
        setSaving(false);
        // Show Auto-save a bit longer (1500ms) after save finishes
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        fadeTimeout.current = setTimeout(() => setShowSaving(false), 1500);
        setDirty(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
  }, []);

  return (
    <div className="space-y-2 relative">
      <label className="text-xs text-muted-foreground">Description</label>
      <Textarea
        placeholder="Add description..."
        className="min-h-[80px] text-xs"
        value={desc}
        onChange={e => {
          setDesc(e.target.value);
          setDirty(true);
        }}
        onBlur={handleBlur}
        disabled={disabled}
        aria-label="Task description"
      />
      {/* Fixed height to avoid shifting layout; absolutely positioned 'Auto-save' */}
      <div className="relative" style={{ minHeight: 16, height: 16 }}>
        {showSaving && (
          <div
            className="absolute left-0 top-0 text-[10px] text-muted-foreground transition-opacity animate-fade-in"
            style={{ pointerEvents: 'none' }}
            aria-live="polite"
          >
            Auto-save
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailDescription;
