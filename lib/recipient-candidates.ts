export function recipientNumberCandidates(phone: string, accountCountryCode: string): string[] {
  const countryCode = accountCountryCode.replace(/\D/g, "");
  if (!countryCode) return [phone];

  const localNumber = phone.replace(/^0+/, "");
  const withAccountCountry = phone.startsWith(countryCode)
    ? phone
    : `${countryCode}${localNumber}`;
  const candidates = phone.startsWith("0")
    ? [withAccountCountry, phone]
    : [phone, withAccountCountry];

  return [...new Set(candidates)];
}
