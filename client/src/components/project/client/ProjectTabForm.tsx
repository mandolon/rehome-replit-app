
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getClientData, updateClientData } from '@/data/projectClientData';

interface ProjectTabFormProps {
  onSave: () => void;
}

interface ProjectTabFormData {
  projectAddress: string;
  city: string;
  state: string;
  projectName: string;
  projectScope: string;
  projectNotes: string;
  status: string;
  startDate: string;
  duration: string;
}

interface FieldConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'input' | 'textarea';
  placeholder: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const ProjectTabForm: React.FC<ProjectTabFormProps> = ({ onSave }) => {
  const { toast } = useToast();
  const { projectId } = useParams<{ projectId: string }>();
  const clientData = getClientData(projectId);

  // Initialize form with existing or default data
  const [formData, setFormData] = useState<ProjectTabFormData>({
    projectAddress: clientData.projectAddress,
    city: clientData.city,
    state: clientData.state,
    projectName: '',
    projectScope: '',
    projectNotes: '',
    status: 'in-progress',
    startDate: '5/8/23',
    duration: '5 Weeks'
  });

  const handleInputChange = (field: keyof ProjectTabFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = () => {
    if (projectId) {
      updateClientData(
        projectId,
        undefined, // ContactId unused here
        formData.projectAddress,
        formData.city,
        formData.state
      );
    }
    toast({
      title: "Changes saved",
      description: "Project information has been updated successfully.",
    });
    onSave();
  };

  // Field configs
  const addressFields: FieldConfig[] = [
    {
      label: 'Project Address',
      value: formData.projectAddress,
      onChange: (value) => handleInputChange('projectAddress', value),
      type: 'input',
      placeholder: 'Enter project address...',
      onKeyDown: handleKeyDown,
    },
    {
      label: 'City',
      value: formData.city,
      onChange: (value) => handleInputChange('city', value),
      type: 'input',
      placeholder: 'Enter city...',
      onKeyDown: handleKeyDown,
    },
    {
      label: 'State',
      value: formData.state,
      onChange: (value) => handleInputChange('state', value),
      type: 'input',
      placeholder: 'Enter state...',
      onKeyDown: handleKeyDown,
    },
  ];

  const projectDetailFields: FieldConfig[] = [
    {
      label: 'Project Name',
      value: formData.projectName,
      onChange: (value) => handleInputChange('projectName', value),
      type: 'textarea',
      placeholder: 'Enter project name...',
      onKeyDown: handleKeyDown,
    },
    {
      label: 'Project Scope',
      value: formData.projectScope,
      onChange: (value) => handleInputChange('projectScope', value),
      type: 'textarea',
      placeholder: 'Describe the project scope...',
      onKeyDown: handleKeyDown,
    },
    {
      label: 'Project Notes',
      value: formData.projectNotes,
      onChange: (value) => handleInputChange('projectNotes', value),
      type: 'textarea',
      placeholder: 'Add any additional project notes...',
      onKeyDown: handleKeyDown,
    },
  ];

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-900 mb-3">Project Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {addressFields.map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                onKeyDown={field.onKeyDown}
                className="h-8 text-xs px-2 border rounded w-full"
                type="text"
              />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {projectDetailFields.map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <textarea
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                onKeyDown={field.onKeyDown}
                className="min-h-[38px] text-xs px-2 border rounded w-full py-1"
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>
      {/* No button here */}
    </div>
  );
};

export default ProjectTabForm;

