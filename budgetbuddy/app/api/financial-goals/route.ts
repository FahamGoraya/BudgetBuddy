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
    
    // Format date as "6 January 2026"
    const dateObj = new Date();
    const currentDate = dateObj.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const model = "gpt-4o-mini";

    console.log("Using model:", model, "Date:", currentDate);

    const contextPrompt = additionalContext 
      ? `\n\nUSER CONTEXT (PRIORITY):\n${additionalContext}`
      : '';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are a financial advisor. Return ONLY valid JSON. No markdown. All numbers positive.

CRITICAL JSON FORMATTING RULE:
- All numeric values MUST be plain numbers WITHOUT comma separators
- CORRECT: "EssentialExpenses": 1760
- WRONG: "EssentialExpenses": 1,760
- NEVER use commas inside numbers. Write 1760, not 1,760. Write 20000, not 20,000.

MOST CRITICAL RULE - BUDGET MUST BALANCE:
EssentialExpenses + Savings + DiscretionarySpending = MonthlyIncome EXACTLY.
Example: If income is 5400, then 2000 + 3100 + 300 = 5400 ✓
NEVER have missing money. ALWAYS verify the sum equals income before responding.

CRITICAL RULES:
1. EssentialExpenses must NEVER be 0. Everyone has living costs. Minimum is 30-50% of income unless user specifies lower.
2. DiscretionarySpending should be at least 5-10% of income for basic quality of life.
3. Savings = Income - EssentialExpenses - DiscretionarySpending (what's left after realistic expenses).
4. If required savings for user's goal exceeds what's possible after realistic expenses, set IsFeasible to false.
5. For job suggestions, be SPECIFIC: mention actual job titles, salary ranges, and platforms.
6. ALWAYS CHECK USER CONTEXT for low-expense keywords: "live with parents", "no rent", "rent-free", "roommates", "living at home". If found, expenses should be MUCH lower (10-30% of income instead of 40-50%).
7. SAVINGS VALIDATION (CRITICAL): 
   - Parse the goal to extract target amount and timeline (e.g., "save $32,000 in 6 months" → $32,000 ÷ 6 = $5,333/month required)
   - Compare RequiredMonthlySavings vs ActualBudgetSavings (IncomeBreakdown.Savings)
   - If ActualBudgetSavings < RequiredMonthlySavings → IsFeasible = false
   - Calculate the SHORTFALL: RequiredMonthlySavings - ActualBudgetSavings
   - Include shortfall in FeasibilityNote and explain what user must do to close the gap
8. FINAL CHECK: Before outputting JSON, verify: EssentialExpenses + Savings + DiscretionarySpending = MonthlyIncome. If not equal, recalculate!`
        },
        { 
          role: "user", 
          content: `Create a financial plan:
- Goal: ${goal}
- Monthly Income: ${monthlyIncome} ${currency}
- Date: ${currentDate}${contextPrompt}

BUDGET ALLOCATION RULES (VERY IMPORTANT):
1. EssentialExpenses: NEVER 0. Estimate realistic costs based on user's situation:
   
   STANDARD (no context given): 40-50% of income
   - Rent/mortgage, utilities, groceries, transportation, insurance, phone
   
   LOW-EXPENSE SITUATIONS (check user context for these keywords):
   - "live with parents" / "living with parents" / "stay with family" → 10-20% of income (no rent, just food/phone/transport/personal)
   - "no rent" / "rent-free" / "paid off house" → 20-30% of income
   - "roommates" / "shared housing" → 30-40% of income
   - "no car" / "no vehicle" / "public transit only" → reduce by 5-10%
   - "employer pays phone/insurance" → reduce accordingly
   
   USER SPECIFIES EXACT AMOUNTS: Use their numbers exactly
   
2. DiscretionarySpending: Minimum 5-10% of income (can be lower like 3-5% if user is aggressive saver)
3. Savings: The remainder after essentials and discretionary
4. If goal mentions "save X in Y months", calculate monthly needed = X ÷ Y
5. FEASIBILITY CHECK (MUST VALIDATE SAVINGS):
   - Step 1: Parse the goal → Extract target amount & months (e.g., "$32,000 in 6 months")
   - Step 2: Calculate RequiredMonthlySavings = TargetAmount ÷ Months
   - Step 3: Calculate realistic budget → EssentialExpenses + DiscretionarySpending
   - Step 4: Calculate ActualSavings = Income - EssentialExpenses - DiscretionarySpending
   - Step 5: Compare: Does ActualSavings ≥ RequiredMonthlySavings?
     → YES: IsFeasible = true, budget savings matches goal
     → NO: IsFeasible = false, show SHORTFALL = RequiredMonthlySavings - ActualSavings
   - Step 6: If not feasible, FeasibilityNote must say: "Your budget can save $X/month, but you need $Y/month. Shortfall: $Z/month. To achieve your goal, you need to: [increase income by $Z] OR [reduce expenses by $Z] OR [extend timeline to N months]"
   - If user has low-expense situation (lives with parents, etc.), this could make aggressive goals FEASIBLE

EXAMPLES:

Example 1 - STANDARD situation, $5,400 income, save $32,000 in 6 months:
- Required savings: $5,333/month
- Realistic essentials: ~$2,000/month (rent, food, utilities, transport)
- Minimum discretionary: ~$300/month
- Actual budget savings: $5,400 - $2,000 - $300 = $3,100/month
- SAVINGS VALIDATION: $3,100 < $5,333 required → SHORTFALL = $2,233/month
- IsFeasible: false
- FeasibilityNote: "Your budget can save $3,100/month, but you need $5,333/month. Shortfall: $2,233/month. To achieve your goal: increase income by $2,233 OR extend timeline to ~10 months."
- Show realistic breakdown: Essentials: $2,000, Savings: $3,100, Discretionary: $300

Example 2 - LOW-EXPENSE situation (user says "I live with my parents"), $5,400 income, save $32,000 in 6 months:
- Required savings: $5,333/month
- Low essentials (no rent!): ~$600/month (food, phone, personal items, gas)
- Minimum discretionary: ~$200/month
- Actual budget savings: $5,400 - $600 - $200 = $4,600/month
- SAVINGS VALIDATION: $4,600 < $5,333 required → SHORTFALL = $733/month
- IsFeasible: false (but much closer than standard situation!)
- FeasibilityNote: "Your budget can save $4,600/month, but you need $5,333/month. Shortfall: $733/month. To achieve your goal: increase income by $733 (part-time job) OR extend timeline to ~7 months."
- Show realistic breakdown: Essentials: $600, Savings: $4,600, Discretionary: $200
- Note: Path1 only needs $800-1000 extra income, not $2000+

Example 3 - LOW-EXPENSE + ACHIEVABLE, $5,400 income, save $20,000 in 6 months (lives with parents):
- Required savings: $3,333/month
- Low essentials (no rent!): ~$600/month
- Minimum discretionary: ~$250/month
- Actual budget savings: $5,400 - $600 - $250 = $4,550/month
- SAVINGS VALIDATION: $4,550 ≥ $3,333 required → NO SHORTFALL ✓
- IsFeasible: TRUE!
- FeasibilityNote: "Great news! Your budget can save $4,550/month, which exceeds the $3,333/month needed. You'll reach your goal in ~4.4 months, ahead of schedule!"
- Show: Essentials: $600, Savings: $4,550, Discretionary: $250

For Path1_IncreaseIncome.HowToAchieve, give SPECIFIC job suggestions:
- If needs extra $500-1500/month: "Part-time delivery driver (DoorDash, Uber Eats - $15-25/hr)", "Freelance on Upwork ($25-50/hr)", "Weekend retail ($15-20/hr)"
- If needs extra $1500-3000/month: "Junior software developer ($4000-5500/month)", "Registered nurse ($4500-6000/month)"
- If needs extra $3000+/month: "Senior software engineer ($7000-12000/month)", "Start consulting in your field"

Return this JSON (fill ALL values with REALISTIC calculations):
{
  "FinancialPlan": {
    "Goal": "${goal}",
    "MonthlyIncome": ${monthlyIncome},
    "Currency": "${currency}",
    "IsFeasible": true,
    "FeasibilityNote": "REQUIRED FORMAT: 'Your budget can save $[ActualSavings]/month, but you need $[RequiredSavings]/month to reach your goal. Shortfall: $[Difference]/month. To achieve your goal: [Option 1: increase income by $X] OR [Option 2: reduce expenses by $Y] OR [Option 3: extend timeline to Z months].'",
    "StructuredPlan": "Detailed explanation with realistic budget advice.",
    "IncomeBreakdown": {
      "EssentialExpenses": 0,
      "EssentialExpensesPurpose": "NEVER 0! Rent/housing, utilities, groceries, transportation, insurance, phone. Use 40-50% of income if not specified.",
      "Savings": 0,
      "SavingsPurpose": "Maximum possible after realistic expenses. Show timeline: 'Saving $X/month toward your goal - achievable in Y months'",
      "DiscretionarySpending": 0,
      "DiscretionarySpendingPurpose": "NEVER 0! Entertainment, dining out, hobbies, subscriptions. Minimum 5-10% of income for quality of life."
    },
    "PathsToAchieveOriginalGoal": {
      "IncludeThis": false,
      "UserOriginalGoal": "Save $X in Y months",
      "MonthlyRequirement": "$X/month needed",
      "Path1_IncreaseIncome": {
        "Title": "Increase your income",
        "RequiredIncome": 0,
        "IncomeIncrease": 0,
        "Description": "Explain exactly how much more they need and why",
        "BudgetAtNewIncome": {
          "Income": 0,
          "EssentialExpenses": 0,
          "Savings": 0,
          "DiscretionarySpending": 0,
          "Explanation": "With this income, you could save $X/month and reach your goal in Y months"
        },
        "HowToAchieve": [
          "SPECIFIC job title with salary range and where to find it",
          "SPECIFIC side hustle with hourly rate and platform",
          "SPECIFIC freelance opportunity with earning potential"
        ]
      },
      "Path2_ReduceExpenses": {
        "Title": "Reduce your expenses",
        "RequiredExpenses": 0,
        "ExpenseReduction": 0,
        "Description": "How much to cut and if it's realistic",
        "BudgetWithReducedExpenses": {
          "Income": ${monthlyIncome},
          "EssentialExpenses": 0,
          "Savings": 0,
          "DiscretionarySpending": 0,
          "Explanation": "Budget breakdown if expenses are reduced"
        },
        "HowToAchieve": [
          "Specific expense to cut with amount saved",
          "Cheaper alternative with savings",
          "Lifestyle change with impact"
        ],
        "IsFeasible": true
      },
      "Path3_ExtendTimeline": {
        "Title": "Extend your timeline",
        "RealisticMonthlySavings": 0,
        "NewTimeline": 0,
        "Description": "With current income, you can save $X/month, reaching your goal in Y months instead of Z",
        "BudgetWithExtendedTimeline": {
          "Income": ${monthlyIncome},
          "EssentialExpenses": 0,
          "Savings": 0,
          "DiscretionarySpending": 0,
          "Explanation": "This is the realistic budget for your current situation"
        },
        "TimelineComparison": "Original: X months | New: Y months | Difference: Z months"
      },
      "Path4_CombinationApproach": {
        "Title": "Combine strategies",
        "ModerateIncomeIncrease": 0,
        "ModerateExpenseReduction": 0,
        "NewIncome": 0,
        "NewExpenses": 0,
        "MonthlySavings": 0,
        "NewTimeline": 0,
        "Description": "Increase income by $X AND reduce expenses by $Y to achieve goal faster",
        "BudgetWithCombination": {
          "Income": 0,
          "EssentialExpenses": 0,
          "Savings": 0,
          "DiscretionarySpending": 0,
          "Explanation": "Combined approach budget"
        }
      },
      "RecommendedPath": "Based on your situation, Path X is most realistic because..."
    },
    "CurrentIncomeFallbackPlan": {
      "Description": "What you can realistically achieve with current income",
      "Breakdown": {
        "EssentialExpenses": 0,
        "Savings": 0,
        "DiscretionarySpending": 0
      },
      "Timeline": "At $X/month savings, you'll reach $Y in Z months",
      "Note": "This is your baseline while working on the paths above"
    }
  }
}

REMEMBER - THESE VALUES MUST NEVER BE 0:
- EssentialExpenses: NEVER 0. Use 40-50% of income if user doesn't specify (everyone pays for housing, food, transport)
- DiscretionarySpending: NEVER 0. Use at least 5-10% of income (everyone needs some personal spending)
- Savings: Calculate as Income - Essentials - Discretionary (this CAN be lower if goal is unrealistic)

REALISTIC BUDGET EXAMPLE for $5,400/month income:
- EssentialExpenses: $2,200 (rent $1,200, utilities $150, groceries $400, transport $300, insurance $150)
- DiscretionarySpending: $400 (entertainment, dining, subscriptions)
- Savings: $2,800 (what's left - this is the max they can save)

If user's goal requires more savings than possible, set IsFeasible = false and show the realistic breakdown above.`
        }
      ],
    });

    // Parse the JSON response from GPT
    const adviceContent = completion.choices[0].message.content;
    
    if (!adviceContent) {
      throw new Error("No content received from OpenAI");
    }

    // Clean and parse the JSON response
    let cleanedContent = adviceContent.trim();
    
    // Remove markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }
    
    // Remove any trailing content after the last }
    const lastBrace = cleanedContent.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleanedContent = cleanedContent.substring(0, lastBrace + 1);
    }
    
    // Find the first { to handle any leading text
    const firstBrace = cleanedContent.indexOf('{');
    if (firstBrace !== -1 && firstBrace > 0) {
      cleanedContent = cleanedContent.substring(firstBrace);
    }
    
    // Fix common JSON issues
    // Fix numbers with comma separators (e.g., 1,760 -> 1760)
    // This regex finds numbers like 1,760 or 10,000 or 1,234,567 and removes the commas
    cleanedContent = cleanedContent.replace(/:\s*(\d{1,3})(,\d{3})+(\s*[,}\]\n])/g, (match, first, rest, ending) => {
      const number = first + rest.replace(/,/g, '');
      return ': ' + number + ending.replace(/^,/, ',');
    });
    // Also fix numbers in arrays or after colons with trailing comma
    cleanedContent = cleanedContent.replace(/(\d),(\d{3})(?=\s*[,}\]\n])/g, '$1$2');
    // Remove trailing commas before } or ]
    cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');
    // Replace "true or false" with true
    cleanedContent = cleanedContent.replace(/"IsFeasible":\s*true or false/g, '"IsFeasible": false');
    cleanedContent = cleanedContent.replace(/"IncludeThis":\s*true or false/g, '"IncludeThis": false');
    // Remove any <...> placeholders that might have been left
    cleanedContent = cleanedContent.replace(/<[^>]+>/g, '0');

    let parsedAdvice;
    try {
      parsedAdvice = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw content:", adviceContent);
      console.error("Cleaned content:", cleanedContent);
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

    // BUDGET VALIDATION: Ensure EssentialExpenses + Savings + DiscretionarySpending = MonthlyIncome
    if (parsedAdvice?.FinancialPlan?.IncomeBreakdown) {
      const breakdown = parsedAdvice.FinancialPlan.IncomeBreakdown;
      const income = parsedAdvice.FinancialPlan.MonthlyIncome || monthlyIncome;
      
      const essential = Number(breakdown.EssentialExpenses) || 0;
      const savings = Number(breakdown.Savings) || 0;
      const discretionary = Number(breakdown.DiscretionarySpending) || 0;
      const total = essential + savings + discretionary;
      
      console.log(`Budget validation: ${essential} + ${savings} + ${discretionary} = ${total} (should be ${income})`);
      
      // If budget doesn't add up, fix it by adjusting savings
      if (Math.abs(total - income) > 1) {
        const difference = income - total;
        console.log(`Budget mismatch! Difference: ${difference}. Adjusting savings...`);
        
        // Recalculate savings to balance the budget
        const correctedSavings = income - essential - discretionary;
        breakdown.Savings = Math.max(0, correctedSavings);
        
        console.log(`Corrected savings: ${breakdown.Savings}`);
        
        // Verify the fix
        const newTotal = essential + breakdown.Savings + discretionary;
        console.log(`New total: ${newTotal} (should match ${income})`);
      }
    }

    // VERIFICATION STEP: Use gpt-5-nano to verify and fix any issues
    console.log("Sending to gpt-5-nano for verification...");
    
    const verificationCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are a financial plan verification AI. Your job is to review a financial plan JSON and FIX any issues.
          
Current Date: ${currentDate}

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, just the corrected JSON.

CRITICAL JSON FORMATTING RULE:
- All numeric values MUST be plain numbers WITHOUT comma separators
- CORRECT: "EssentialExpenses": 1760
- WRONG: "EssentialExpenses": 1,760
- NEVER use commas inside numbers. Write 1760, not 1,760. Write 20000, not 20,000.

ISSUES TO CHECK AND FIX:

1. BUDGET BALANCE ISSUES:
   - EssentialExpenses + Savings + DiscretionarySpending MUST EXACTLY equal MonthlyIncome
   - If they don't add up, recalculate Savings = MonthlyIncome - EssentialExpenses - DiscretionarySpending
   - Check ALL IncomeBreakdown objects in paths (Path1, Path2, Path3, Path4) for balance

2. ZERO VALUE ISSUES:
   - EssentialExpenses should NEVER be 0 (minimum 10-15% of income even if living with parents)
   - DiscretionarySpending should NEVER be 0 (minimum 3-5% of income)
   - If any are 0, set reasonable defaults based on income

3. FEASIBILITY CALCULATION ERRORS:
   - Parse the goal to extract target amount and timeline
   - RequiredMonthlySavings = TargetAmount / Months
   - If Savings in IncomeBreakdown < RequiredMonthlySavings, IsFeasible MUST be false
   - If Savings >= RequiredMonthlySavings, IsFeasible MUST be true
   - FeasibilityNote must accurately reflect the math

4. NEGATIVE VALUE ISSUES:
   - All monetary values must be positive (>= 0)
   - If any negative values found, set to 0 or recalculate

5. MISSING FIELD ISSUES:
   - Ensure all required fields exist in FinancialPlan
   - Ensure IncomeBreakdown has: EssentialExpenses, Savings, DiscretionarySpending
   - Add missing fields with calculated values

6. MATH ERRORS IN PATHS:
   - Path1_IncreaseIncome: RequiredIncome should = current income + IncomeIncrease
   - Path2_ReduceExpenses: Budget totals must still equal income
   - Path3_ExtendTimeline: NewTimeline = TargetAmount / RealisticMonthlySavings (rounded up)
   - Path4: Combined savings calculation must be accurate

7. TIMELINE CALCULATION ERRORS:
   - Verify Path3 timeline: months = total goal amount / monthly savings
   - Timeline should be a whole number (rounded up)
   - TimelineComparison should show accurate original vs new values

8. LOGICAL INCONSISTENCIES:
   - If IsFeasible is true but savings < required, fix IsFeasible to false
   - If IsFeasible is false but savings >= required, fix IsFeasible to true
   - Ensure FeasibilityNote matches IsFeasible boolean

9. STRING FORMAT ISSUES:
   - Currency values in descriptions should be formatted consistently
   - Remove any placeholder text like "<amount>" or "[value]"
   - Ensure all descriptions are complete sentences

10. PATH INCLUSION LOGIC:
    - If IsFeasible is false, PathsToAchieveOriginalGoal.IncludeThis should be true
    - If IsFeasible is true, IncludeThis can be false (paths optional)

11. SHORTFALL CALCULATION:
    - Shortfall = RequiredMonthlySavings - ActualSavings
    - Must be reflected accurately in FeasibilityNote
    - Path1 IncomeIncrease should match or exceed shortfall

12. ROUNDING ISSUES:
    - Round all monetary values to 2 decimal places or whole numbers
    - Ensure rounding doesn't break budget balance

After fixing all issues, return the complete corrected JSON object.`
        },
        {
          role: "user",
          content: `Please verify and fix any issues in this financial plan JSON:

Original User Goal: ${goal}
Monthly Income: ${monthlyIncome} ${currency}
Current Date: ${currentDate}
User Context: ${additionalContext || 'None provided'}

Financial Plan to Verify:
${JSON.stringify(parsedAdvice, null, 2)}

Return the corrected JSON only. Fix ALL issues found.`
        }
      ],
    });

    const verifiedContent = verificationCompletion.choices[0].message.content;
    
    if (!verifiedContent) {
      console.log("Verification returned no content, using original parsed advice");
      return NextResponse.json({
        success: true,
        data: parsedAdvice,
      });
    }

    // Clean and parse the verified JSON response
    let cleanedVerifiedContent = verifiedContent.trim();
    
    // Remove markdown code blocks
    if (cleanedVerifiedContent.startsWith('```json')) {
      cleanedVerifiedContent = cleanedVerifiedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedVerifiedContent.startsWith('```')) {
      cleanedVerifiedContent = cleanedVerifiedContent.replace(/```\n?/g, '');
    }
    
    // Remove any trailing content after the last }
    const lastBraceVerified = cleanedVerifiedContent.lastIndexOf('}');
    if (lastBraceVerified !== -1) {
      cleanedVerifiedContent = cleanedVerifiedContent.substring(0, lastBraceVerified + 1);
    }
    
    // Find the first { to handle any leading text
    const firstBraceVerified = cleanedVerifiedContent.indexOf('{');
    if (firstBraceVerified !== -1 && firstBraceVerified > 0) {
      cleanedVerifiedContent = cleanedVerifiedContent.substring(firstBraceVerified);
    }
    
    // Fix common JSON issues
    // Fix numbers with comma separators (e.g., 1,760 -> 1760)
    cleanedVerifiedContent = cleanedVerifiedContent.replace(/:\s*(\d{1,3})(,\d{3})+(\s*[,}\]\n])/g, (match, first, rest, ending) => {
      const number = first + rest.replace(/,/g, '');
      return ': ' + number + ending.replace(/^,/, ',');
    });
    cleanedVerifiedContent = cleanedVerifiedContent.replace(/(\d),(\d{3})(?=\s*[,}\]\n])/g, '$1$2');
    // Remove trailing commas before } or ]
    cleanedVerifiedContent = cleanedVerifiedContent.replace(/,(\s*[}\]])/g, '$1');
    cleanedVerifiedContent = cleanedVerifiedContent.replace(/"IsFeasible":\s*true or false/g, '"IsFeasible": false');
    cleanedVerifiedContent = cleanedVerifiedContent.replace(/"IncludeThis":\s*true or false/g, '"IncludeThis": false');
    cleanedVerifiedContent = cleanedVerifiedContent.replace(/<[^>]+>/g, '0');

    let verifiedAdvice;
    try {
      verifiedAdvice = JSON.parse(cleanedVerifiedContent);
      console.log("Verification successful - using verified and corrected response");
    } catch (verifyParseError) {
      console.error("Verification JSON Parse Error, using original response:", verifyParseError);
      // If verification parsing fails, use the original parsed advice
      verifiedAdvice = parsedAdvice;
    }

    // Return the verified data back
    return NextResponse.json({
      success: true,
      data: verifiedAdvice,
      verified: true,
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
