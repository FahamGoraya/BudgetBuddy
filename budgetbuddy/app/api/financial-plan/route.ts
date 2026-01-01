import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { financialPlan } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
    // Check JWT and get current user
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
    
    try {
        // Get financial plan associated with the user
        const [plan] = await db
            .select()
            .from(financialPlan)
            .where(eq(financialPlan.userId, currentUser.userId))
        
        if (!plan) {
            // Return that plan is not available
            return NextResponse.json({
                success: true,
                hasPlan: false,
                message: 'No financial plan found for this user'
            })
        }
        
        // Return the plan data
        return NextResponse.json({
            success: true,
            hasPlan: true,
            plan
        })
    } catch (error: any) {
        console.error('Error fetching financial plan:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    // Check JWT and get current user
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
    
    try {
        const data = await request.json()
        
        // Check if user already has a plan
        const [existingPlan] = await db
            .select()
            .from(financialPlan)
            .where(eq(financialPlan.userId, currentUser.userId))
        
        if (existingPlan) {
            // Update existing plan
            const [updatedPlan] = await db
                .update(financialPlan)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(eq(financialPlan.userId, currentUser.userId))
                .returning()
            
            return NextResponse.json({
                success: true,
                plan: updatedPlan
            })
        } else {
            // Create new plan
            const [newPlan] = await db
                .insert(financialPlan)
                .values({
                    ...data,
                    userId: currentUser.userId,
                })
                .returning()
            
            return NextResponse.json({
                success: true,
                plan: newPlan
            })
        }
    } catch (error: any) {
        console.error('Error saving financial plan:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
