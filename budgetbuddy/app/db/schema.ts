import { pgTable, text, timestamp, boolean, real, index, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const financialPlan = pgTable('financial_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  goal: text('goal').notNull(),
  monthlyIncome: real('monthly_income').notNull(),
  currency: text('currency').notNull(),
  structuredPlan: text('structured_plan').notNull(),
  essentialExpenses: real('essential_expenses').notNull(),
  essentialExpensesPurpose: text('essential_expenses_purpose').notNull(),
  savings: real('savings').notNull(),
  savingsPurpose: text('savings_purpose').notNull(),
  discretionarySpending: real('discretionary_spending').notNull(),
  discretionarySpendingPurpose: text('discretionary_spending_purpose').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
