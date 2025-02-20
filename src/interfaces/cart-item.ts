export interface CartItem {
  productId: string;
  quantity: number;
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
}
