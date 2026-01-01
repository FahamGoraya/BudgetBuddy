import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { getCurrentUser } from '@/app/lib/auth'
import { financialPlan } from '@/app/db/schema'

export async function GET() {
    try {
        const allUsers = await db.select().from(users)
        return NextResponse.json(allUsers)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const currentUser = getCurrentUser(request)
    const plan = await request.json()
    
    if (!currentUser) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
           
            { status: 401 }
        )
    }

    const incomeBreakdown = plan.IncomeBreakdown;

    const CurrentPlan = {
        id: crypto.randomUUID(),
        userId: currentUser.userId,
        goal: plan.Goal,
        monthlyIncome: plan.MonthlyIncome,
        currency: plan.Currency,
        structuredPlan: plan.StructuredPlan,
        essentialExpenses: incomeBreakdown.EssentialExpenses,
        essentialExpensesPurpose: incomeBreakdown.EssentialExpensesPurpose,
        savings: incomeBreakdown.Savings,
        savingsPurpose: incomeBreakdown.SavingsPurpose,
        discretionarySpending: incomeBreakdown.DiscretionarySpending,
        discretionarySpendingPurpose: incomeBreakdown.DiscretionarySpendingPurpose,
    }
    await db.insert(financialPlan).values(CurrentPlan)     
    

    return NextResponse.json({ message: 'User is authenticated', user: currentUser })
}

