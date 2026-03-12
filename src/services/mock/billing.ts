// src/services/mock/billing.ts
export interface Bill {
   id: string;
   appointmentId: string;
   patientId: string;
   patientName?: string;
   totalAmount: number;
   discount: number;
   status: "PENDING" | "PAID" | "CANCELLED";
   payments: Payment[];
   createdAt: string;
}

export interface Payment {
   id: string;
   amount: number;
   method: "CASH" | "CARD" | "INSURANCE";
   createdAt: string;
}

// In-memory store
let bills: Bill[] = [
   {
      id: "b1",
      appointmentId: "a1",
      patientId: "p1",
      patientName: "John Smith",
      totalAmount: 150,
      discount: 10,
      status: "PENDING",
      payments: [],
      createdAt: new Date().toISOString(),
   },
   {
      id: "b2",
      appointmentId: "a2",
      patientId: "p2",
      patientName: "Emily Johnson",
      totalAmount: 200,
      discount: 0,
      status: "PAID",
      payments: [
         {
            id: "p1",
            amount: 200,
            method: "CASH",
            createdAt: new Date().toISOString(),
         },
      ],
      createdAt: new Date().toISOString(),
   },
];

export const BillingAPI = {
   createBill: async (data: {
      appointmentId: string;
      patientId: string;
      totalAmount: number;
      discount?: number;
   }): Promise<Bill> => {
      const newBill: Bill = {
         id: `b${Date.now()}`,
         ...data,
         discount: data.discount || 0,
         status: "PENDING",
         payments: [],
         createdAt: new Date().toISOString(),
      };
      bills.push(newBill);
      return newBill;
   },

   getBill: async (id: string): Promise<Bill | undefined> => {
      return bills.find((b) => b.id === id);
   },

   payBill: async (
      billId: string,
      paymentData: { amount: number; method: Payment["method"] },
   ): Promise<Bill> => {
      const bill = bills.find((b) => b.id === billId);
      if (!bill) throw new Error("Bill not found");
      const payment: Payment = {
         id: `pay${Date.now()}`,
         ...paymentData,
         createdAt: new Date().toISOString(),
      };
      bill.payments.push(payment);
      // Check if total paid equals total after discount
      const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
      const totalDue = bill.totalAmount - bill.discount;
      if (totalPaid >= totalDue) {
         bill.status = "PAID";
      }
      return bill;
   },

   getPatientBills: async (patientId: string): Promise<Bill[]> => {
      return bills.filter((b) => b.patientId === patientId);
   },

   getClinicBills: async (clinicId: string): Promise<Bill[]> => {
      // For mock, just return all
      return bills;
   },
};
