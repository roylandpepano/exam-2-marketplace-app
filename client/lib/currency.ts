export const currencyFormatter = new Intl.NumberFormat("en-PH", {
   style: "currency",
   currency: "PHP",
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
   return currencyFormatter.format(value ?? 0);
}
