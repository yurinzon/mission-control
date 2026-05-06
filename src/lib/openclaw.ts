export async function invokeTool(tool: string, args: any = {}) {
  const res = await fetch(`${process.env.GATEWAY_URL}/tools/invoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GATEWAY_TOKEN}`
    },
    body: JSON.stringify({ tool, args }),
    cache: "no-store"
  });
  
  const envelope = await res.json();
  if (!envelope.ok) {
    throw new Error(envelope.error || "Gateway error");
  }
  
  // Unwrap the OpenClaw standard envelope
  const textContent = envelope.result?.content?.find((c: any) => c.type === "text")?.text;
  if (!textContent) return envelope.result;
  
  try {
    return JSON.parse(textContent);
  } catch (e) {
    return textContent;
  }
}
