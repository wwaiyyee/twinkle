import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { functions, functionMap } from "./index";

import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper to convert OpenAI messages to Anthropic messages
function convertToAnthropicMessages(openaiMessages: any[]): any[] {
    return openaiMessages
        .filter(msg => msg.role !== 'system') // System messages are handled separately
        .map(msg => {
            if (msg.role === 'user') {
                return { role: 'user', content: msg.content };
            }
            if (msg.role === 'assistant') {
                // Handle tool calls in assistant message if any (not needed for simple migration if we don't pass history with tool calls from frontend)
                // For now, assuming simple text content or handling previous turn
                return { role: 'assistant', content: msg.content || "" };
            }
            if (msg.role === 'tool') {
                // OpenAI tool response -> Anthropic tool_result
                return {
                    role: 'user',
                    content: [
                        {
                            type: 'tool_result',
                            tool_use_id: msg.tool_call_id,
                            content: msg.content,
                        }
                    ]
                };
            }
            return msg;
        });
}

// Helper to convert OpenAI tool definitions to Anthropic tools
function convertToAnthropicTools(openaiFunctions: any[]): any[] {
    return openaiFunctions.map(fn => ({
        name: fn.name,
        description: fn.description,
        input_schema: fn.parameters,
    }));
}

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages) {
            res.status(400).json({ error: "Messages are required" });
            return;
        }

        // Extract system message
        const systemMessage = messages.find((m: any) => m.role === 'system')?.content ||
            `You are a strict but helpful teacher. Your goal is to help students learn.
            You ONLY answer questions related to the following subjects:
            1. Chinese (Language, Vocabulary, Culture)
            2. English Vocabulary (Definitions, Synonyms, Usage)
            3. Math (Arithmetic, Algebra, Geometry, etc.)
            4. Grammar (English or Chinese grammar rules)

            If a user asks about anything else (e.g., history, science, entertainment, general chat unrelated to learning these subjects), you must politely decline and remind them that you can only help with Chinese, English Vocabulary, Math, or Grammar.
            
            Be encouraging and educational in your responses.`;

        let anthropicMessages = convertToAnthropicMessages(messages);
        const tools = convertToAnthropicTools(functions);

        // First call to Anthropic
        let msg = await anthropic.messages.create({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 1024,
            system: systemMessage,
            messages: anthropicMessages,
            tools: tools,
        });

        // Check for tool use
        if (msg.stop_reason === "tool_use") {
            // Append assistant's tool use message to history
            anthropicMessages.push({
                role: "assistant",
                content: msg.content
            });

            // Execute tools
            const toolResults = [];
            for (const contentBlock of msg.content) {
                if (contentBlock.type === "tool_use") {
                    const functionName = contentBlock.name;
                    const functionArgs = contentBlock.input;
                    const toolUseId = contentBlock.id;

                    const toolFunction = functionMap[functionName as keyof typeof functionMap];

                    if (toolFunction) {
                        console.log(`Executing tool: ${functionName}`);
                        const functionResult = await toolFunction.handler(functionArgs as any);

                        toolResults.push({
                            type: "tool_result",
                            tool_use_id: toolUseId,
                            content: JSON.stringify(functionResult)
                        });
                    }
                }
            }

            // Append tool results to history
            if (toolResults.length > 0) {
                anthropicMessages.push({
                    role: "user",
                    content: toolResults
                });

                // Get final response
                msg = await anthropic.messages.create({
                    model: "claude-3-5-haiku-20241022",
                    max_tokens: 1024,
                    system: systemMessage,
                    messages: anthropicMessages,
                    tools: tools,
                });
            }
        }

        // Convert Anthropic response to OpenAI format for frontend compatibility
        const textContent = msg.content.find((c: any) => c.type === "text") as any;
        const responseContent = textContent ? textContent.text : "";

        const openaiCompatibleResponse = {
            role: "assistant",
            content: responseContent,
        };

        res.json(openaiCompatibleResponse);

    } catch (error: any) {
        console.error("Error in chat endpoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

import { runMultiAgentSystem } from "./multiAgent";

app.post("/api/multi-agent", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            res.status(400).json({ error: "Query is required" });
            return;
        }

        const result = await runMultiAgentSystem(query);
        res.json(result);
    } catch (error) {
        console.error("Error in multi-agent endpoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
