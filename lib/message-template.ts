export const RECIPIENT_NAME_TAG = "{recipient name}";

const RECIPIENT_NAME_PATTERN = /\{recipient\s+name\}|\{reciptent\s+name\}|\{\{name\}\}/gi;

export function personalizeMessage(template: string, recipientName?: string): string {
  return template.replace(RECIPIENT_NAME_PATTERN, recipientName?.trim() ?? "");
}
