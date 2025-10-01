
export type ProductSize = {
    id: string;
    name: string; // e.g., '40ml', '500ml'
};

export type FeeSettings = {
    transactionPercent: number; // e.g. 2.9 for 2.9%
    fixed: number; // e.g. 30 for KES 30
};

export type DeliveryFee = {
    county: string;
    fee: number;
};

export type GlobalSettings = {
    productSizes: ProductSize[];
    fees: FeeSettings;
    deliveryFees: DeliveryFee[];
};

export const globalSettings: GlobalSettings = {
    productSizes: [
        { id: 'size-1', name: '40ml' },
        { id: 'size-2', name: '500ml' },
        { id: 'size-3', name: '800ml' },
    ],
    fees: {
        transactionPercent: 2.9,
        fixed: 0,
    },
    deliveryFees: [
        { county: 'Nairobi', fee: 300 },
        { county: 'Kiambu', fee: 400 },
        { county: 'Machakos', fee: 500 },
    ],
};
