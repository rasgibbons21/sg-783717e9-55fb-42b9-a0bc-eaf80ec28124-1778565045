const FREE_TOOLS = ["stock-analyzer"];

export function canAccessTool(slug: string, isPaid: boolean): boolean {
  if (isPaid) return true;
  return FREE_TOOLS.includes(slug);
}
