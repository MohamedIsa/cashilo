import { radius, shadow, spacing, typography, withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Transaction } from '@/model/Transaction';
import { getCurrency, getTransactions } from '@/storage';
import { EXPENSE_CATEGORIES_EN, EXPENSE_CATEGORY_COLORS, INCOME_CATEGORIES_EN, INCOME_CATEGORY_COLORS } from '@/utils/categories';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RangeKey = 'today' | 'lastWeek' | 'lastMonth' | 'last6Months' | 'lastYear';
const RANGES: RangeKey[] = ['today', 'lastWeek', 'lastMonth', 'last6Months', 'lastYear'];

function filterByRange(transactions: Transaction[], range: RangeKey): Transaction[] {
  const now = new Date();
  let start = new Date();
  switch (range) {
    case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
    case 'lastWeek': start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case 'lastMonth': start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break;
    case 'last6Months': start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()); break;
    case 'lastYear': start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
  }
  return transactions.filter((t) => new Date(t.date) >= start);
}

function groupByMonth(transactions: Transaction[]): Record<string, { income: number; expenses: number; saving: number }> {
  const result: Record<string, { income: number; expenses: number; saving: number }> = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!result[key]) result[key] = { income: 0, expenses: 0, saving: 0 };
    if (t.type === 'Income') result[key].income += t.amount;
    else if (t.category === 'Saving') result[key].saving += t.amount;
    else result[key].expenses += t.amount;
  });
  return result;
}

function buildCategoryPie(transactions: Transaction[], type: 'Income' | 'Expense', categories: string[], colors: string[]) {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });

  return categories
    .map((cat, i) => ({ name: cat, population: map[cat] ?? 0, color: colors[i % colors.length], legendFontColor: '#888', legendFontSize: 11 }))
    .filter((d) => d.population > 0);
}

export default function Reports() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const chartWidth = width - spacing.lg * 2;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrencySymbol] = useState('$');
  const [range, setRange] = useState<RangeKey>('lastMonth');

  const loadData = useCallback(async () => {
    const [txns, cur] = await Promise.all([getTransactions(), getCurrency()]);
    const symbols: Record<string, string> = { USD: '$', EUR: '€', SAR: '﷼', EGP: 'E£', BHD: 'BD' };
    setTransactions(txns);
    setCurrencySymbol(symbols[cur] ?? '$');
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filterByRange(transactions, range);
  const totalIncome = filtered.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const totalSaving = filtered.filter((t) => t.category === 'Saving').reduce((s, t) => s + t.amount, 0);

  const overviewPie = [
    { name: t('income'), population: totalIncome, color: theme.secondary, legendFontColor: theme.primaryText, legendFontSize: 12 },
    { name: t('expenses'), population: totalExpenses, color: theme.error, legendFontColor: theme.primaryText, legendFontSize: 12 },
    { name: t('saving'), population: totalSaving, color: theme.primary, legendFontColor: theme.primaryText, legendFontSize: 12 },
  ].filter((d) => d.population > 0);

  const incomePie = buildCategoryPie(filtered, 'Income', INCOME_CATEGORIES_EN, INCOME_CATEGORY_COLORS);
  const expensePie = buildCategoryPie(filtered, 'Expense', EXPENSE_CATEGORIES_EN, EXPENSE_CATEGORY_COLORS);

  const monthlyData = groupByMonth(transactions);
  const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
  const barLabels = sortedMonths.map((m) => m.slice(5));
  const barIncomeData = sortedMonths.map((m) => monthlyData[m].income);
  const barExpenseData = sortedMonths.map((m) => monthlyData[m].expenses);

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: () => theme.primaryText,
    style: { borderRadius: radius.md },
    propsForDots: { r: '4', strokeWidth: '2', stroke: theme.primary },
  };

  const monthBreakdown = Object.entries(groupByMonth(filtered)).sort(([a], [b]) => b.localeCompare(a));
  const noData = filtered.length === 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.md }}>
        <Text style={{ color: theme.headline, ...typography.display, marginBottom: spacing.xl }}>
          {t('overview')}
        </Text>
      </View>

      {/* Range selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md }}
      >
        {RANGES.map((r) => {
          const active = range === r;
          return (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: active ? theme.primary : theme.card,
              }}
            >
              <Text style={{ color: active ? '#fff' : theme.primaryText, ...typography.label, fontWeight: active ? '700' : '400' }}>
                {t(r)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {noData ? (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ color: withAlpha(theme.primaryText, 0.5), ...typography.body }}>{t('noData')}</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
          {overviewPie.length > 0 && (
            <SectionCard title={t('incomeExpensesSaving')} theme={theme}>
              <PieChart
                data={overviewPie}
                width={chartWidth}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
              />
            </SectionCard>
          )}

          {sortedMonths.length > 0 && (
            <SectionCard title={t('monthlyIncomeExpenses')} theme={theme}>
              <BarChart
                data={{
                  labels: barLabels.length > 0 ? barLabels : [''],
                  datasets: [
                    { data: barIncomeData.length > 0 ? barIncomeData : [0], color: () => theme.secondary },
                    { data: barExpenseData.length > 0 ? barExpenseData : [0], color: () => theme.error },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                yAxisLabel={currency}
                yAxisSuffix=""
                fromZero
                showBarTops
                style={{ borderRadius: radius.md }}
              />
            </SectionCard>
          )}

          {incomePie.length > 0 && (
            <SectionCard title={t('incomeBreakdown')} theme={theme}>
              <PieChart
                data={incomePie}
                width={chartWidth}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
              />
            </SectionCard>
          )}

          {expensePie.length > 0 && (
            <SectionCard title={t('expenseBreakdown')} theme={theme}>
              <PieChart
                data={expensePie}
                width={chartWidth}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
              />
            </SectionCard>
          )}

          {monthBreakdown.length > 0 && (
            <SectionCard title={t('monthlyBreakdown')} theme={theme}>
              {monthBreakdown.map(([month, data]) => (
                <View
                  key={month}
                  style={{
                    marginBottom: spacing.sm,
                    paddingVertical: spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: withAlpha(theme.primaryText, 0.08),
                  }}
                >
                  <Text style={{ color: theme.headline, ...typography.label, marginBottom: spacing.sm }}>{month}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <MonthStat label={t('income')} amount={data.income} color={theme.secondary} currency={currency} />
                    <MonthStat label={t('expenses')} amount={data.expenses} color={theme.error} currency={currency} />
                    <MonthStat label={t('saving')} amount={data.saving} color={theme.primary} currency={currency} />
                  </View>
                </View>
              ))}
            </SectionCard>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function SectionCard({ title, children, theme }: { title: string; children: React.ReactNode; theme: any }) {
  return (
    <View
      style={{
        borderRadius: radius.lg,
        backgroundColor: theme.card,
        padding: spacing.lg,
        ...shadow.sm,
      }}
    >
      <Text style={{ color: theme.headline, ...typography.heading, marginBottom: spacing.md }}>{title}</Text>
      {children}
    </View>
  );
}

function MonthStat({ label, amount, color, currency }: { label: string; amount: number; color: string; currency: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color, ...typography.label, fontVariant: ['tabular-nums'] }} selectable>
        {currency}{amount.toFixed(2)}
      </Text>
      <Text style={{ color: '#888', ...typography.caption, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
