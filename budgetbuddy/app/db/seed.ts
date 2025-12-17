import { db } from '@/app/db'
import { users, categories, expenses, budgets } from '@/app/db/schema'

async function seed() {
  console.log('Seeding database...')

  const [user] = await db.insert(users).values({
    email: 'demo@budgetbuddy.com',
    name: 'Demo User',
    avatar: '👤',
    currency: 'USD',
  }).returning()

  console.log('Created user:', user)

  const categoryData = [
    { name: 'Food & Dining', color: '#FF6384', userId: user.id },
    { name: 'Transportation', color: '#36A2EB', userId: user.id },
    { name: 'Shopping', color: '#FFCE56', userId: user.id },
    { name: 'Entertainment', color: '#4BC0C0', userId: user.id },
    { name: 'Bills & Utilities', color: '#9966FF', userId: user.id },
    { name: 'Healthcare', color: '#FF9F40', userId: user.id },
    { name: 'Education', color: '#C9CBCF', userId: user.id },
    { name: 'Travel', color: '#7C4DFF', userId: user.id },
    { name: 'Other', color: '#607D8B', userId: user.id },
  ]

  const insertedCategories = await db.insert(categories).values(categoryData).returning()
  console.log('Created categories:', insertedCategories.length)

  const foodCategory = insertedCategories.find(c => c.name === 'Food & Dining')
  const transportCategory = insertedCategories.find(c => c.name === 'Transportation')

  if (foodCategory) {
    await db.insert(expenses).values({
      description: 'Grocery Shopping',
      amount: 85.5,
      date: new Date(),
      userId: user.id,
      categoryId: foodCategory.id,
      isRecurring: false,
    })

    await db.insert(budgets).values({
      limit: 500,
      spent: 85.5,
      month: new Date().toISOString().slice(0, 7),
      userId: user.id,
      categoryId: foodCategory.id,
    })
  }

  if (transportCategory) {
    await db.insert(expenses).values({
      description: 'Gas',
      amount: 45.0,
      date: new Date(),
      userId: user.id,
      categoryId: transportCategory.id,
      isRecurring: false,
    })
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
