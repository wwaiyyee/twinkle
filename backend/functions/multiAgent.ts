import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SMALL_MODEL = "claude-3-5-haiku-20241022";
const BIG_MODEL = "claude-3-5-sonnet-20240620";

interface AgentResponse {
    agentId: number;
    role: string;
    content: string;
}

const AGENT_ROLES = [
    "Analytical: Focus on facts, data, and logical structure.",
    "Creative: Focus on innovative ideas, metaphors, and out-of-the-box thinking.",
    "Critical: Focus on potential flaws, risks, and counter-arguments.",
    "Practical: Focus on actionable steps, implementation details, and feasibility."
];

async function generateInsight(query: string, agentId: number): Promise<AgentResponse> {
    const role = AGENT_ROLES[agentId];
    const systemPrompt = `You are one of 4 AI agents working together. Your specific role is: ${role}. 
    Provide your unique insight on the user's query. Keep it concise (under 150 words).`;

    try {
        const msg = await anthropic.messages.create({
            model: SMALL_MODEL,
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: "user", content: query }],
        });

        const textContent = msg.content.find(c => c.type === "text") as any;
        return {
            agentId,
            role: role.split(":")[0],
            content: textContent ? textContent.text : "No content generated."
        };
    } catch (error) {
        console.error(`Error in agent ${agentId}:`, error);
        return { agentId, role: role.split(":")[0], content: "Error generating insight." };
    }
}

async function generateCritique(query: string, insights: AgentResponse[], agentId: number): Promise<AgentResponse> {
    const role = AGENT_ROLES[agentId];
    const otherInsights = insights.filter(i => i.agentId !== agentId);
    const insightsText = otherInsights.map(i => `[Agent ${i.role}]: ${i.content}`).join("\n\n");

    const systemPrompt = `You are one of 4 AI agents. Your role is: ${role}.
    Review the insights provided by the other agents:
    ${insightsText}
    
    Provide a critique or judgment on their insights based on your perspective. 
    Highlight what you agree with, what you disagree with, and why. Keep it concise (under 150 words).`;

    try {
        const msg = await anthropic.messages.create({
            model: SMALL_MODEL,
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: "user", content: `Original Query: ${query}` }],
        });

        const textContent = msg.content.find(c => c.type === "text") as any;
        return {
            agentId,
            role: role.split(":")[0],
            content: textContent ? textContent.text : "No critique generated."
        };
    } catch (error) {
        console.error(`Error in agent ${agentId} critique:`, error);
        return { agentId, role: role.split(":")[0], content: "Error generating critique." };
    }
}

async function synthesizeAndTailor(query: string, insights: AgentResponse[], critiques: AgentResponse[]): Promise<string> {
    const insightsText = insights.map(i => `[Agent ${i.role} Insight]: ${i.content}`).join("\n\n");
    const critiquesText = critiques.map(c => `[Agent ${c.role} Critique]: ${c.content}`).join("\n\n");

    const systemPrompt = `You are the Lead AI Architect. You have received insights and critiques from 4 specialized agents regarding a user's query.
    
    User Query: ${query}
    
    --- INSIGHTS ---
    ${insightsText}
    
    --- CRITIQUES ---
    ${critiquesText}
    
    Your task:
    1. Synthesize all the information into a cohesive summary.
    2. Based on this synthesis, "tailor a room" for the user. This means describing a conceptual or physical space (a "room") that perfectly suits their needs based on the query and the agents' analysis. Describe the atmosphere, the furniture, the tools available, and the general vibe.
    
    Format your response as:
    
    ## Executive Summary
    (Your synthesis here)
    
    ## Your Tailored Room
    (Your room description here)`;

    try {
        const msg = await anthropic.messages.create({
            model: BIG_MODEL,
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: "user", content: "Please synthesize and tailor the room." }],
        });

        const textContent = msg.content.find(c => c.type === "text") as any;
        return textContent ? textContent.text : "Error generating summary.";
    } catch (error) {
        console.error("Error in synthesis:", error);
        return "Error in synthesis process.";
    }
}

export async function runMultiAgentSystem(query: string) {
    console.log("Starting Phase 1: Generating Insights...");
    const insightPromises = Array.from({ length: 4 }, (_, i) => generateInsight(query, i));
    const insights = await Promise.all(insightPromises);

    console.log("Starting Phase 2: Generating Critiques...");
    const critiquePromises = Array.from({ length: 4 }, (_, i) => generateCritique(query, insights, i));
    const critiques = await Promise.all(critiquePromises);

    console.log("Starting Phase 3: Synthesis and Tailoring...");
    const finalOutput = await synthesizeAndTailor(query, insights, critiques);

    return {
        insights,
        critiques,
        finalOutput
    };
}
