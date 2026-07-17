import { NextResponse } from "next/server";
import { getPrisma } from "@/library/prisma";
import { validatePrivateAgentMessage } from "@/server/agent/guardrails";
import { authorizeMcp } from "@/server/agent/mcp-auth";
import { retrieveKnowledge } from "@/server/agent/knowledge";
import { askSteven } from "@/server/agent/service";

export const runtime = "nodejs";

type JsonRpcRequest = { jsonrpc?: string; id?: string | number | null; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };

const tools = [
  { name: "ask_steven", description: "Ask the private Steven Agent a sourced question.", inputSchema: { type: "object", properties: { question: { type: "string" } }, required: ["question"], additionalProperties: false } },
  { name: "search_steven_knowledge", description: "Search Steven's approved private and public knowledge without generating an answer.", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"], additionalProperties: false } },
  { name: "propose_steven_memory", description: "Propose a memory for Steven to review; this never auto-approves it.", inputSchema: { type: "object", properties: { statement: { type: "string" } }, required: ["statement"], additionalProperties: false } },
] as const;

function rpc(id: JsonRpcRequest["id"], result: unknown, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { status });
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string, status = 400) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

function requiredScope(method: string | undefined, toolName?: string) {
  if (method !== "tools/call") return "steven:search";
  if (toolName === "ask_steven") return "steven:ask";
  if (toolName === "propose_steven_memory") return "steven:memory:propose";
  return "steven:search";
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  const auth = await authorizeMcp(request, requiredScope(body.method, body.params?.name));
  if (!auth) {
    const origin = new URL(request.url).origin;
    return new NextResponse(JSON.stringify({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32001, message: "Unauthorized" } }), {
      status: 401,
      headers: { "Content-Type": "application/json", "WWW-Authenticate": `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"` },
    });
  }

  if (body.method === "initialize") return rpc(body.id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "steven-agent", version: "1.0.0" } });
  if (body.method === "notifications/initialized") return new NextResponse(null, { status: 202 });
  if (body.method === "tools/list") return rpc(body.id, { tools });
  if (body.method !== "tools/call" || !body.params?.name) return rpcError(body.id, -32601, "Method not found");

  const args = body.params.arguments ?? {};
  if (body.params.name === "ask_steven") {
    const validation = validatePrivateAgentMessage(args.question);
    if (!validation.ok) return rpcError(body.id, -32602, "Invalid question");
    const result = await askSteven({ scope: "PRIVATE", message: validation.value, ownerSub: auth.subject });
    return rpc(body.id, { content: [{ type: "text", text: result.answer }], structuredContent: result });
  }
  if (body.params.name === "search_steven_knowledge") {
    const validation = validatePrivateAgentMessage(args.query);
    if (!validation.ok) return rpcError(body.id, -32602, "Invalid query");
    const matches = await retrieveKnowledge(validation.value, "PRIVATE");
    return rpc(body.id, { content: [{ type: "text", text: matches.map((item) => `${item.sourceName}: ${item.content}`).join("\n\n") }], structuredContent: { matches } });
  }
  if (body.params.name === "propose_steven_memory") {
    const validation = validatePrivateAgentMessage(args.statement);
    if (!validation.ok) return rpcError(body.id, -32602, "Invalid statement");
    const candidate = await getPrisma().memoryCandidate.create({ data: { scope: "PRIVATE", content: validation.value, evidence: { channel: "mcp", actorSub: auth.subject } } });
    return rpc(body.id, { content: [{ type: "text", text: "Memory proposed for Steven's review." }], structuredContent: { candidateId: candidate.id, status: candidate.status } });
  }
  return rpcError(body.id, -32602, "Unknown tool");
}
