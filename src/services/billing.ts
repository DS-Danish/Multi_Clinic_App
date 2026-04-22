import { apiRequest } from "./api";

export interface Payment {
   id: string;
   amount: number;
   method: "CASH" | "CARD" | "INSURANCE" | string;
   createdAt: string;
}

export interface Bill {
   id: string;
   appointmentId: string;
   patientId: string;
   patientName?: string;
   totalAmount: number;
   discount: number;
   status: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED" | string;
   payments: Payment[];
   createdAt: string;
}

const normalizeBill = (bill: any): Bill => ({
   id: bill.id,
   appointmentId: bill.appointmentId,
   patientId: bill.patientId,
   patientName: bill.patient?.name || bill.patientName,
   totalAmount: bill.totalAmount,
   discount: bill.discount ?? 0,
   status: bill.status,
   payments: bill.payments || [],
   createdAt: bill.createdAt,
});

export const BillingAPI = {
   createBill: async (data: {
      appointmentId: string;
      patientId: string;
      totalAmount: number;
      discount?: number;
   }): Promise<Bill> => {
      const response = await apiRequest<any>("/receptionist/bills", {
         method: "POST",
         body: data,
      });

      return normalizeBill(response);
   },

   getBill: async (id: string): Promise<Bill> => {
      const response = await apiRequest<any>(`/billing/${id}`);
      return normalizeBill(response);
   },

   payBill: async (
      billId: string,
      paymentData: { amount: number; method: Payment["method"] },
   ): Promise<Bill> => {
      const response = await apiRequest<any>("/receptionist/payments", {
         method: "POST",
         body: {
            billId,
            ...paymentData,
         },
      });

      return normalizeBill(response);
   },

   getPatientBills: async (patientId: string): Promise<Bill[]> => {
      const response = await apiRequest<any[]>(`/billing/patient/${patientId}`);
      return response.map(normalizeBill);
   },
};
