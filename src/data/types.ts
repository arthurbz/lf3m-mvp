export const PaymentMethod = {
  PIX: 1,
  CreditCard: 2,
  DebitCard: 3,
  Boleto: 4,
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.PIX]: "PIX",
  [PaymentMethod.CreditCard]: "Cartão de Crédito",
  [PaymentMethod.DebitCard]: "Cartão de Débito",
  [PaymentMethod.Boleto]: "Boleto",
};

export type Method = {
  type: PaymentMethod;
  description: string | null;
  fixedFeeInCents: number;
  percentageFee: number;
  installments: string | null;
};

export type PaymentGateway = {
  name: string;
  imageUrl: string;
  sourceUrl: string;
  note: string | null;
  supportedOptions: Array<Method>;
};
