export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
}
