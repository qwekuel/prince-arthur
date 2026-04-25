/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Fine {
  id: string;
  plateNumber: string;
  offense: string;
  location: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
}

export type NetworkProvider = 'MTN' | 'Vodafone' | 'AirtelTigo';

export interface PaymentDetails {
  fineId: string;
  phoneNumber: string;
  network: NetworkProvider;
  amount: number;
}
