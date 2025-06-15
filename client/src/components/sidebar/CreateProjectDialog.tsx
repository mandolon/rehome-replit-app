
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { projectStatusData, convertDisplayNameToProjectId } from '@/data/projectStatus';
import { projectClientData } from '@/data/projectClientData';

const createProjectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  projectAddress: z.string().min(1, 'Project address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  secondaryFirstName: z.string().optional(),
  secondaryLastName: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  children: React.ReactNode;
}

const CreateProjectDialog = ({ children }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const { triggerRefresh } = useProjectData();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      projectAddress: '',
      city: 'Sacramento',
      state: 'CA',
      secondaryFirstName: '',
      secondaryLastName: '',
    },
  });

  const getNextProjectId = () => {
    const existingIds = Object.values(projectClientData)
      .map(client => parseInt(client.projectId))
      .filter(id => !isNaN(id))
      .sort((a, b) => b - a);
    
    const highestId = existingIds.length > 0 ? existingIds[0] : 0;
    return String(highestId + 1).padStart(5, '0');
  };

  const onSubmit = (data: CreateProjectFormData) => {
    // Create display name
    const displayName = `${data.lastName} - ${data.projectAddress}`;
    
    // Generate project ID
    const projectId = convertDisplayNameToProjectId(displayName);
    const numericProjectId = getNextProjectId();

    // Add to project status data
    projectStatusData.inProgress.push(displayName);

    // Add to client data -- wrap primary client in 'clients' array
    projectClientData[projectId] = {
      clients: [
        {
          clientId: `${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: "",
          isPrimary: true
        }
      ],
      projectAddress: data.projectAddress,
      city: data.city,
      state: data.state,
      projectId: numericProjectId
    };

    console.log('Created new project:', {
      displayName,
      projectId,
      numericProjectId,
    });

    // Trigger refresh and close dialog
    triggerRefresh();
    setOpen(false);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="projectAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="secondaryFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
