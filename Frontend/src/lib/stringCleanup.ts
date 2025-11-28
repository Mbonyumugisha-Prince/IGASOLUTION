/**
 * Removes escaped quotes from the beginning and end of a string
 * Example: "\"Learn Python\"" -> "Learn Python"
 */
export const cleanEscapedQuotes = (str: string | undefined | null): string => {
  if (!str) return '';
  
  // Remove leading escaped quotes
  let cleaned = str.replace(/^\\"|"$/g, '');
  // Also handle case where quotes are not escaped
  cleaned = cleaned.replace(/^"|"$/g, '');
  
  return cleaned.trim();
};
