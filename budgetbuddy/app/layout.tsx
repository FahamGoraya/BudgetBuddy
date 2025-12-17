import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import MainLayout from "./components/MainLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BudgetBuddy - Expense Tracker",
  description: "Personal finance app with charts, budget categories, and data visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <ExpenseProvider>
            <MainLayout>{children}</MainLayout>
          </ExpenseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
