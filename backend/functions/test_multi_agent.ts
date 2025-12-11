import axios from "axios";

async function testMultiAgent() {
    const query = "How can I design a minimalist yet cozy living room?";
    console.log(`Testing Multi-Agent System with query: "${query}"`);

    try {
        const response = await axios.post("http://localhost:3001/api/multi-agent", {
            query
        });

        const data = response.data;
        console.log("\n--- Insights ---");
        data.insights.forEach((insight: any) => {
            console.log(`\n[Agent ${insight.role}]: ${insight.content.substring(0, 100)}...`);
        });

        console.log("\n--- Critiques ---");
        data.critiques.forEach((critique: any) => {
            console.log(`\n[Agent ${critique.role}]: ${critique.content.substring(0, 100)}...`);
        });

        console.log("\n--- Final Output ---");
        console.log(data.finalOutput);

    } catch (error: any) {
        console.error("Error testing multi-agent system:", error.response ? error.response.data : error.message);
    }
}

testMultiAgent();
