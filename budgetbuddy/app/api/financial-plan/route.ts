import { NextRequest, NextResponse, userAgent } from 'next/server'
import { db } from '@/app/db'
import { financialPlan } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/app/lib/auth'
import redisClient from '@/app/redis/redis'

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

        // Create a unique cache key for the user's financial plan
        const cacheKey = `user:${currentUser.userId}:financialPlan`;
        
        // Try to get the plan from Redis cache
        const cachedPlan = await redisClient.get(cacheKey);
        if (cachedPlan) {
            return NextResponse.json({
                success: true,
                hasPlan: true,
                plan: JSON.parse(cachedPlan)
            });
        }


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
        // Cache the plan in Redis for future requests (set an expiration time, e.g., 1 hour)
        await redisClient.set(cacheKey, JSON.stringify(plan), {
            EX: 3600 // Expire in 1 hour
        });
        
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
        
        // Invalidate Redis cache
        const cacheKey = `user:${currentUser.userId}:financialPlan`;
        await redisClient.del(cacheKey);
        
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

export async function DELETE(request: NextRequest) {
    // Check JWT and get current user
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
    
    try {
        // Check if user has a plan
        const [existingPlan] = await db
            .select()
            .from(financialPlan)
            .where(eq(financialPlan.userId, currentUser.userId))
        
        if (!existingPlan) {
            return NextResponse.json({
                success: false,
                message: 'No financial plan found to delete'
            }, { status: 404 })
        }
        
        // Delete the plan
        await db
            .delete(financialPlan)
            .where(eq(financialPlan.userId, currentUser.userId))
        
        // Invalidate Redis cache
        const cacheKey = `user:${currentUser.userId}:financialPlan`;
        await redisClient.del(cacheKey);
        
        return NextResponse.json({
            success: true,
            message: 'Financial plan deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting financial plan:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
