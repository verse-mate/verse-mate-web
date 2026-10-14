export const routeOfPage = (dir: string, key: string) => {
  if (!key.startsWith(`${dir}/`)) return undefined;
  const parts = key.slice(dir.length + 1).replace(/\.[jt]sx$/, "").split("/");
  if (parts.some((p) => p.startsWith("_")) || parts.at(-1)?.startsWith("+")) return undefined;
  if (parts.at(-1) === "index") parts.pop();
  return `/${parts.join("/")}`;
};
