export const toISODate = (grDate: string) => {
  const [dd, mm, yyyy] = grDate.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

export const weightToNumber = (kg: string | number | null) => {
  if (kg === null) return null;
  if (typeof kg === 'number') return kg;
  const lower = kg.toLowerCase();
  if (lower.includes('σωματικό')) return null;
  const num = parseFloat(lower.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : null;
};
