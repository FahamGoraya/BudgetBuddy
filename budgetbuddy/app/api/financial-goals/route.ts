import { getCurrentUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
export async function POST(request: Request) {
  try {
    const { goal, monthlyIncome, currency, additionalContext } = await request.json();
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
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
    const currentDate = new Date().toISOString().split('T')[0];

    let model;
    if (!additionalContext){
      model = "gpt-4.1-nano";
    }
    else{
      model = "gpt-4o-mini";
    }


    const contextPrompt = additionalContext 
      ? `\n\nCRITICAL USER-SPECIFIC CONTEXT (MUST BE CONSIDERED):\n${additionalContext}\n\nThis context may include multiple refinements and specific details about their living situation, expenses, and circumstances. It may also include a SPECIFIC SAVINGS TARGET and TIMELINE. If the user mentions how much they want to save and by when, you MUST calculate the exact monthly savings needed and use that number. Carefully adjust ALL aspects of the budget breakdown based on this information.`
      : '';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ 
        role: "user", 
        content: `You are an experienced financial advisor creating a highly personalized financial plan.

USER INFORMATION:
Goal: ${goal}
Monthly Income: ${monthlyIncome}
Currency: ${currency}${contextPrompt}
Current Date: ${currentDate}

CRITICAL MATHEMATICAL REQUIREMENTS:
1. EssentialExpenses + Savings + DiscretionarySpending MUST equal EXACTLY ${monthlyIncome}
2. If user specifies a savings target and timeline (e.g., "save $10,000 in 12 months"), you MUST calculate the exact monthly savings needed (target amount ÷ months) and use that as the Savings value
3. Calculate each value carefully and verify the sum before responding

SAVINGS CALCULATION PRIORITY:
- If user says "save X amount in Y months/years" → Savings = X ÷ Y (converted to months)
- If user says "save X per month" → Savings = X
- If no specific amount mentioned → Calculate reasonable savings based on goal and income
- If calculated savings + essential expenses exceed income → Set IsFeasible to false

INSTRUCTIONS:
1. If additional context is provided above, THIS MUST BE YOUR PRIMARY CONSIDERATION
2. **PARSE THE USER CONTEXT FOR SAVINGS TARGETS**: Look for phrases like "save $X in Y months", "save $X by [date]", "monthly savings of $X", etc.
3. If a savings target and timeline are mentioned, calculate the EXACT monthly savings required and use that number
4. Adjust the budget to reflect their specific circumstances accurately
5. If the goal is financially impossible given their income and context (e.g., essential expenses + required savings exceed income), you MUST set "IsFeasible" to false and explain why
6. The StructuredPlan should acknowledge their savings target and timeline if specified
7. Essential expenses should reflect their actual living situation (use their stated expenses if provided)
8. VERIFY that all three amounts sum to exactly ${monthlyIncome} before finalizing

Return ONLY a valid JSON object with this EXACT structure (no additional text, no markdown):
{
  "FinancialPlan": {
    "Goal": "${goal}",
    "MonthlyIncome": ${monthlyIncome},
    "Currency": "${currency}",
    "IsFeasible": true or false,
    "FeasibilityNote": "Only include if IsFeasible is false. Explain specifically why the goal cannot be achieved with current income and circumstances. Show the math: 'You need $X/month for savings + $Y for essentials = $Z total, but income is only ${monthlyIncome}'. Suggest alternatives like extending timeline or reducing expenses.",
    "StructuredPlan": "A detailed but concise paragraph (3-5 sentences) explaining how to achieve this goal. If user specified a savings target and timeline, explicitly mention it (e.g., 'To save $10,000 in 12 months, you'll need to set aside $833/month...'). If not feasible, explain what changes would be needed.",
    "IncomeBreakdown": {
      "EssentialExpenses": <number reflecting their actual situation>,
      "EssentialExpensesPurpose": "Specific description based on their context (e.g., 'Living with parents - covers phone $50, insurance $150, gas $100' or 'Rent $1200, utilities $150, groceries $400, student loans $300, transportation $200')",
      "Savings": <exact number calculated from their target and timeline, or reasonable amount if not specified>,
      "SavingsPurpose": "If they specified a target: 'Saving $X/month to reach your goal of [target amount] in [timeline]'. If not: 'How these savings specifically help achieve their stated goal with estimated timeline'",
      "DiscretionarySpending": <number calculated as: monthlyIncome - EssentialExpenses - Savings>,
      "DiscretionarySpendingPurpose": "What this covers for their specific lifestyle (entertainment, dining out, hobbies, etc.)"
    },
    "SavingsCalculation": "Show your work if a specific target was mentioned: e.g., '$10,000 goal ÷ 12 months = $833/month' or 'No specific target mentioned, allocated X% for [goal type]'"
  }
}

EXAMPLES:

Example 1 - Specific savings target:
User context: "I want to save $5000 in 10 months for a vacation. I live with parents so my expenses are low, about $300/month."
Income: $2000
→ Savings MUST be: $5000 ÷ 10 = $500/month
→ EssentialExpenses: $300 (as stated)
→ DiscretionarySpending: $2000 - $300 - $500 = $1200

Example 2 - Impossible goal:
User context: "I need to save $3000/month. My rent is $1800, other expenses $500."
Income: $2500
→ Required: $3000 + $1800 + $500 = $5300
→ IsFeasible: false (need $5300 but only have $2500)

Example 3 - No specific target:
User context: "I want to save for retirement, I spend about $1500/month."
Income: $3000
→ Savings: Calculate reasonable amount (e.g., 15-20% for retirement = $450-600)
→ Adjust based on income and expenses

VERIFICATION CHECKLIST BEFORE RESPONDING:
[ ] Parsed user context for specific savings amounts and timelines
[ ] If savings target mentioned, calculated exact monthly amount needed
[ ] EssentialExpenses reflects user's stated expenses (if provided)
[ ] EssentialExpenses + Savings + DiscretionarySpending = ${monthlyIncome} (exact match)
[ ] If goal requires more than income allows, IsFeasible is false with clear math explanation
[ ] SavingsPurpose mentions their specific target if they provided one
[ ] Response is valid JSON only (no markdown, no extra text)`
      }],
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
