// English category lists (used for storage)
export const INCOME_CATEGORIES_EN = [
  'Salary',
  'Bonus',
  'Investment',
  'Business',
  'Gift',
  'Refund',
  'Freelance',
  'Grants',
  'Other',
];

export const EXPENSE_CATEGORIES_EN = [
  'Food',
  'Shopping',
  'Bills',
  'Transport',
  'Health',
  'Education',
  'Entertainment',
  'Travel',
  'Groceries',
  'Rent',
  'Utilities',
  'Insurance',
  'Subscriptions',
  'Charity',
  'Personal Care',
  'Taxes',
  'Loan Payment',
  'Pets',
  'Gifts',
  'Other',
];

/**
 * Maps an English category key to a localized display name using i18n arrays.
 * Pass the translated arrays from useTranslation().
 */
export function getLocalizedCategory(
  category: string,
  incomeCategories: string[],
  expenseCategories: string[],
): string {
  const incomeIdx = INCOME_CATEGORIES_EN.indexOf(category);
  if (incomeIdx !== -1) return incomeCategories[incomeIdx] ?? category;

  const expenseIdx = EXPENSE_CATEGORIES_EN.indexOf(category);
  if (expenseIdx !== -1) return expenseCategories[expenseIdx] ?? category;

  if (category === 'Saving') return category;
  if (category === 'From Saving') return category;

  return category;
}

export const INCOME_CATEGORY_COLORS = [
  '#36B37E',
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#009688',
  '#9C27B0',
  '#3F51B5',
  '#00B8D9',
  '#795548',
];

export const EXPENSE_CATEGORY_COLORS = [
  '#FF5630',
  '#F44336',
  '#FF9800',
  '#9C27B0',
  '#FFC107',
  '#3F51B5',
  '#00BCD4',
  '#795548',
  '#E91E63',
  '#CDDC39',
  '#FF5722',
  '#673AB7',
  '#2196F3',
  '#4CAF50',
  '#009688',
  '#9C27B0',
  '#00B8D9',
  '#36B37E',
];
