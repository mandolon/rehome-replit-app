
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvoiceDetailsProps {
  total: number;
}

const InvoiceDetails = ({ total }: InvoiceDetailsProps) => {
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currentDate = getCurrentDate();

  // This would ideally come from a shared context or props
  // For now, using the client data structure from ClientTab
  const getProjectFromClientData = () => {
    // This represents the client data that would come from the Client tab
    const clientData = {
      firstName: 'Celine',
      lastName: 'Donaldson', 
      projectAddress: '2717 58th Street'
    };
    
    return `${clientData.lastName} - ${clientData.projectAddress}`;
  };

  const createProjectId = (lastName: string, address: string) => {
    const lastNamePart = lastName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const addressPart = address.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${lastNamePart}-${addressPart}`;
  };

  // All projects from the sidebar - these should eventually be generated from client data
  const allProjects = [
    'Adams - 1063 40th Street',
    'Ogden - Thew - 2709 T Street',
    '1524 Tiverton',
    '2015 10th Street',
    '2200 I Street',
    'Adamo - 6605 S. Land Park Dr.',
    'McVarish - Salmina - 6251 El Dorado Street',
    'Andre - 2119 H Street',
    'Fleming-Veisze - 1111 33rd Street',
    'Ganson - 2125 I Street',
    'DeCarlo - 1141 Swanston Dr',
    'Green - 920 U Street',
    'Kubein - Plymouth Project',
    'McLeod-Joffe - 2436 59th Street',
    'Piner Haus Garage',
    'Rathbun - USFS Cabin',
    'Vasquez -Gutierrez - 2508 55th Street',
    'Wilcox - 1808 U Street',
    '14401 Grand Island Road',
    'Asani - 1915 F Street',
    'Basques - 1414 H Street',
    'Benke - 3001 22nd Street',
    'Cheng - 14 Maple Circle',
    'Cordano - 2626 I Street',
    'Donatelle - 820 53rd Street',
    'Donaldson - 2717 58th Street',
    'Gabel - 1601 B Street',
    'Graves - 4121 A Street',
    'Hoefs - 1701 35th Street',
    'Kristoff - 5527 H Street',
    'Krueger - 1911 Eastshore Road',
    'Madrigal - 1700 E Street',
    'McLeod-Joffe - 924 J Street',
    'Mishad - 2009 K Street',
    'Montoya - 4004 T Street',
    'Ptak - 11004 Mead Court',
    'Saldana - Wilkinson - 2600 K Street',
    'Saribay - 1500 S Street',
    'Scott - Fetkenhour - 14705 Grapevine Ave',
    'Speck - 2126 P Street',
    'Takamatsu - 1501 Q Street',
    'Abeliuk - 24350 E Main Str.',
    'Boland - 1216 42nd Street',
    'Boyer - 1831 J Street',
    'Bruckert - 2700 Stockton Blvd',
    'Hass - 1616 54th Street',
    'Hahn - 1601 45th Street',
    'Harrison - 2615 T Street',
    'Johnson - 2619 E Street',
    'Klein - 910 W 2nd Street',
    'Knecht - 200 I Street',
    'Knedler - 6140 S Land Park Dr.',
    'Mckee - 4326 A Street',
    'Miller - 701 18th Street',
    'Moss - 3405 E Street',
    'Plourde - 4504 Freeport Blvd',
    'Preskitt - 6140 S Land Park Dr',
    'Purcell - 1501 G Street',
    'Seitz - 1400 N Street',
    'Wang - 2424 E Street',
    'White - 2330 B Street',
    'Wu - 922 J Street',
    'Zhechev - 3120 I Street'
  ];

  const generateProjectId = (projectName: string) => {
    // For projects that follow "LastName - Address" format
    if (projectName.includes(' - ')) {
      const [lastName, address] = projectName.split(' - ');
      return createProjectId(lastName, address);
    }
    // For projects that are just addresses (like "1524 Tiverton")
    return projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-sm font-medium">Invoice</h2>
        <div className="text-right">
          <div className="text-xs font-medium">#RH25000355</div>
          <div className="text-xs text-muted-foreground mt-1">{currentDate}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <Select>
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {allProjects.map((project, index) => (
              <SelectItem key={index} value={generateProjectId(project)}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Invoice Date</span>
            <span className="text-xs font-medium">{currentDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Submitted to:</span>
            <span className="text-xs font-medium">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Project Address:</span>
            <span className="text-xs font-medium">-</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold">${total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
