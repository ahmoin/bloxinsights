import { openrouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  type UIMessage,
} from "ai";
import { headers } from "next/headers";
import { analyzeTools } from "@/lib/ai/tools";
import { auth } from "@/lib/auth";

const ANALYZE_MODEL = "google/gemini-2.5-flash";
const MAX_STEPS = 5;

const SYSTEM_PROMPT = `You are the Bloxinsights analyst, an assistant that helps users understand and act on Roblox platform data: game rankings, player counts (CCU), trending momentum, and platform-wide stats.

Use the available tools to look up real data before stating specific numbers, rankings, or facts about games — never guess or invent numbers. If a tool returns no data, say so plainly instead of making something up.

Beyond reporting data, you can also reason about it: spot patterns, compare games, and brainstorm ideas (e.g. game concepts, thumbnail angles, growth strategies) informed by what the data shows. Ground that reasoning in the tool results you've gathered, but don't refuse to be creative or opinionated just because the request goes beyond a raw data lookup.

When a tool returns a list of games or stats, the UI already renders that data as a table or card — do not repeat it as a markdown table or list. Just add a short sentence of commentary (what stands out, a direct answer to the question), and only spell out individual numbers when the user asked to compare specific games or needs a number that isn't obvious from the table. Keep answers concise.`;

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await request.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openrouter(ANALYZE_MODEL),
    messages: modelMessages,
    system: SYSTEM_PROMPT,
    tools: analyzeTools,
    stopWhen: isStepCount(MAX_STEPS),
  });

  return result.toUIMessageStreamResponse();
}
