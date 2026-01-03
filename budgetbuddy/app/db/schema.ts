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

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  color: text('color').notNull().default('#10b981'),
  icon: text('icon').notNull().default('receipt'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('categories_user_id_idx').on(table.userId),
  unique('categories_user_id_name_unique').on(table.userId, table.name),
])

export const budgets = pgTable('budgets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  categoryId: text('category_id').notNull().references(() => categories.id),
  amount: real('amount').notNull(),
  period: text('period').notNull().default('monthly'), // monthly, yearly
  spent: real('spent').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('budgets_user_id_idx').on(table.userId),
  index('budgets_category_id_idx').on(table.categoryId),
])

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  categoryId: text('category_id').notNull().references(() => categories.id),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('expenses_user_id_idx').on(table.userId),
  index('expenses_category_id_idx').on(table.categoryId),
  index('expenses_date_idx').on(table.date),
])

export const financialGoals = pgTable('financial_goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').notNull().default(0),
  deadline: timestamp('deadline').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('financial_goals_user_id_idx').on(table.userId),
])
