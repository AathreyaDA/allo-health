export interface Inventory {
  id: string;
  totalStock: number;
  reservedStock: number;

  warehouse: {
    id: string;
    name: string;
    location: string;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  inventories: Inventory[];
}