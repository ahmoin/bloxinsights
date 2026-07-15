"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ToolUIPart } from "ai";
import { SparklesIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  type GameRow,
  type MoverRow,
  type PlatformStatsOutput,
  PlatformStatsResult,
  SearchGamesResult,
  TopGamesResult,
  TrendingGamesResult,
} from "@/components/sections/analyze/tool-results";

const SUGGESTIONS = [
  "What are the biggest games right now?",
  "What's trending on Roblox today?",
  "How does Blox Fruits compare to Brookhaven?",
  "What's the current platform-wide CCU?",
];

function renderToolResult(part: ToolUIPart) {
  if (part.state !== "output-available") {
    return null;
  }

  switch (part.type) {
    case "tool-getTopGames": {
      const output = part.output as { games: GameRow[] };
      return <TopGamesResult games={output.games} />;
    }
    case "tool-getTrendingGames": {
      const output = part.output as { movers: MoverRow[] };
      return <TrendingGamesResult movers={output.movers} />;
    }
    case "tool-searchGames": {
      const output = part.output as { games: GameRow[] };
      return <SearchGamesResult games={output.games} />;
    }
    case "tool-getPlatformStats": {
      const output = part.output as PlatformStatsOutput | { error: string };
      if ("error" in output) {
        return <p className="text-muted-foreground text-sm">{output.error}</p>;
      }
      return <PlatformStatsResult {...output} />;
    }
    default:
      return null;
  }
}

export function AnalyzeChat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/analyze" }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim();
    if (!text) {
      return;
    }
    sendMessage({ text });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Conversation>
        <ConversationContent className="min-h-full">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="Ask about top games, trending momentum, or platform-wide stats"
              icon={<SparklesIcon className="size-8" />}
              title="Analyze Roblox data"
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, index) => {
                    const key = `${message.id}-${index}`;
                    if (part.type === "text") {
                      return (
                        <MessageResponse key={key}>{part.text}</MessageResponse>
                      );
                    }
                    if (part.type.startsWith("tool-")) {
                      const toolPart = part as ToolUIPart;
                      const result = renderToolResult(toolPart);
                      if (result) {
                        return <div key={key}>{result}</div>;
                      }
                      return (
                        <Tool key={key}>
                          <ToolHeader
                            state={toolPart.state}
                            type={toolPart.type}
                          />
                          <ToolContent>
                            <ToolInput input={toolPart.input} />
                            <ToolOutput
                              errorText={toolPart.errorText}
                              output={toolPart.output}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {messages.length === 0 && (
        <Suggestions>
          {SUGGESTIONS.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={(value) => sendMessage({ text: value })}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>
      )}
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea placeholder="Ask about games, rankings, or platform stats..." />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
