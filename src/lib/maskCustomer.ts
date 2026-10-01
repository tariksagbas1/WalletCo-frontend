/** Staff-facing phone: 05334108871 → ****-***-8871 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "";
  return `****-***-${digits.slice(-4)}`;
}

/** Staff-facing surname: Yakışır → Y. */
export function maskLastName(lastName: string | null | undefined): string {
  const trimmed = lastName?.trim() ?? "";
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toLocaleUpperCase("tr-TR")}.`;
}

export function staffCustomerName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = firstName?.trim() ?? "";
  const last = maskLastName(lastName);
  return [first, last].filter(Boolean).join(" ");
}
