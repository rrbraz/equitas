export const expenseCategoryOptions = [
  { label: "Refeição", slug: "comida" },
  { label: "Transporte", slug: "transporte" },
  { label: "Hospedagem", slug: "hospedagem" },
  { label: "Casa", slug: "casa" },
  { label: "Outro", slug: "outro" },
] as const;

export function getExpenseCategorySlug(label: string) {
  return (
    expenseCategoryOptions.find((option) => option.label === label)?.slug ??
    "outro"
  );
}

export function getExpenseCategoryLabel(slug: string) {
  return (
    expenseCategoryOptions.find((option) => option.slug === slug)?.label ??
    "Outro"
  );
}
