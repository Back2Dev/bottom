type PageData = any;

export const loadPageData = async (path: string): Promise<PageData | null> => {
  const res = await fetch(`/api/puck?path=${encodeURIComponent(path)}`, {
    method: "GET",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
};

export const savePageData = async (
  path: string,
  data: PageData
): Promise<void> => {
  const res = await fetch(`/api/puck`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path, data }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to save page data");
  }
};
