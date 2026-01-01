import { NextResponse } from "next/server";
import OpenAI from "openai";
export async function POST(request: Request) {
  try {
    const { goal, monthlyIncome, currency, additionalContext } = await request.json();


    // Validate required fields
    if (!goal || !monthlyIncome || !currency) {
      return NextResponse.json(
        { error: "Goal, monthly income, and currency are required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const contextPrompt = additionalContext 
      ? `\n\n CRITICAL USER-SPECIFIC CONTEXT (MUST BE CONSIDERED):\n${additionalContext}\n\nThis context may include multiple refinements and specific details about their living situation, expenses, and circumstances. Carefully adjust ALL aspects of the budget breakdown based on this information. Be realistic and precise - if they mention specific costs or situations (like living with parents, student loans, higher food costs, etc.), reflect that accurately in the numbers and descriptions.`
      : '';

    const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [{ role: "user", 
      content: `You are an experienced financial advisor creating a highly personalized financial plan.

 USER INFORMATION:
Goal: ${goal}
Monthly Income: ${monthlyIncome}
Currency: ${currency}${contextPrompt}

INSTRUCTIONS:
1. If additional context is provided above, THIS MUST BE YOUR PRIMARY CONSIDERATION
2. Adjust the budget to reflect their specific circumstances accurately
3. The StructuredPlan should acknowledge and address the context they provided
4. Essential expenses should reflect their actual living situation
5. Be specific and actionable in your advice

Return ONLY a valid JSON object with this EXACT structure (no additional text):
{
  "FinancialPlan": {
    "Goal": "${goal}",
    "MonthlyIncome": ${monthlyIncome},
    "Currency": "${currency}",
    "StructuredPlan": "A detailed but short so that the user can easily understand, context-aware paragraph explaining how to achieve this goal. If user context was provided, explicitly reference and address it in your plan.",
    "IncomeBreakdown": {
      "EssentialExpenses": <number reflecting their actual situation>,
      "EssentialExpensesPurpose": "Specific description based on their context (e.g., mention if living with parents, student loans, etc.)",
      "Savings": <number that's realistic for their goal and situation>,
      "SavingsPurpose": "How these savings specifically help achieve their stated goal",
      "DiscretionarySpending": <number>,
      "DiscretionarySpendingPurpose": "What this covers for their specific lifestyle"
    }
  }
}

 CRITICAL: All three amounts (EssentialExpenses, Savings, DiscretionarySpending) MUST add up to exactly ${monthlyIncome}. and english only please.`   }],
    });

    // Parse the JSON response from GPT
    const adviceContent = completion.choices[0].message.content;
    
    if (!adviceContent) {
      throw new Error("No content received from OpenAI");
    }

    // Try to parse the JSON, handling any markdown code blocks
    let cleanedContent = adviceContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }

    const parsedAdvice = JSON.parse(cleanedContent);

    // Return the data back
    return NextResponse.json({
      success: true,
      data: parsedAdvice,
    });
  } catch (error) {
    console.error("Error processing financial goals:", error);
    
    // Provide more detailed error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Full error details:", errorMessage);
    
    return NextResponse.json(
      { 
        error: "Failed to generate financial plan",
        details: errorMessage,
        success: false 
      },
      { status: 500 }
    );
  }
}
