
export interface Invoice {
  id: string;
  lastName: string;
  projectAddress: string;
  status: string;
  amount: string;
  dateCreated: string;
}

export const invoicesData: Invoice[] = [
  {
    id: "RH15465",
    lastName: "Johnson",
    projectAddress: "123 Oak Street",
    status: "Paid",
    amount: "$304.65",
    dateCreated: "Jan 12, 2023"
  },
  {
    id: "RH65842",
    lastName: "Smith",
    projectAddress: "456 Maple Avenue",
    status: "Sent",
    amount: "$450.00",
    dateCreated: "Jan 15, 2023"
  },
  {
    id: "RH78123",
    lastName: "Williams",
    projectAddress: "789 Pine Road",
    status: "Unpaid",
    amount: "$750.25",
    dateCreated: "Jan 20, 2023"
  },
  {
    id: "RH89456",
    lastName: "Brown",
    projectAddress: "321 Elm Drive",
    status: "Paid",
    amount: "$525.80",
    dateCreated: "Jan 25, 2023"
  },
  {
    id: "RH91234",
    lastName: "Davis",
    projectAddress: "654 Cedar Lane",
    status: "Sent",
    amount: "$200.00",
    dateCreated: "Jan 30, 2023"
  }
];
