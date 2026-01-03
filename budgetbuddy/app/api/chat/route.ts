import OpenAI from "openai";
import { getCurrentUser } from "@/app/lib/auth";
import { db } from '@/app/db'
import { financialPlan } from '@/app/db/schema'
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});




export async function POST(request: Request) {
 


 
  try {
    const { message, conversationHistory = [] } = await request.json();
    const encoder = new TextEncoder();
    const user = getCurrentUser(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const plan = await db.select().from(financialPlan).where(eq(financialPlan.userId, user.userId));
    if (!plan || plan.length === 0) {
      return new Response(
        JSON.stringify({ error: "No financial plan found for user. Please create a financial plan first." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const SYSTEM_PROMPT = `You are BudgetBuddy, a friendly and knowledgeable personal finance assistant. You help users:
    - Track and manage their expenses
    - Create and stick to budgets
    - Understand their spending patterns
    - Set and achieve financial goals
    - Get personalized money-saving tips
    - If the user asks to change their current financial plan just tell them to simply navigate to the Financial Goals section of the app and create a new plan there.
    - You are strictly forbidden from answering any question that is not related to personal finance or budgeting. If the user asks anything outside of these topics, politely inform them that you can only assist with personal finance and budgeting-related queries
    bed time stories included.
    - The financial plan for the user is as follows:
    ${JSON.stringify(plan[0])}

    Be concise, helpful, and encouraging. Use simple language and avoid jargon. When discussing numbers, be specific and practical. Always maintain a positive, supportive tone.`;


    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.chat.completions.create({
            model: "gpt-4.1-nano",
            messages,
            stream: true,
          });

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (err) {
          console.error("OpenAI streaming error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
