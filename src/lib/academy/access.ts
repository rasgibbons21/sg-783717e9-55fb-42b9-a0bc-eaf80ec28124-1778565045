const FREE_TOOLS = ["stock-analyzer"];

export function canAccessTool(slug: string, isPro: boolean): boolean {
  if (isPro) return true;
  return FREE_TOOLS.includes(slug);
}
