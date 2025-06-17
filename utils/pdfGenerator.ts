import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

interface CategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  limit: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
  notifications: boolean;
}

export const generateAnalyticsPDF = async (
  categories: CategoryData[],
  budgets: BudgetCategory[],
  onLoadingChange: (loading: boolean) => void
) => {
  try {
    onLoadingChange(true);

    // Check if categories array is empty
    if (!categories || categories.length === 0) {
      Alert.alert(
        'No Data Available',
        'There is no spending data available to generate a report.',
        [{ text: 'OK' }]
      );
      onLoadingChange(false);
      return;
    }

    // Calculate total spent
    const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0);

    // Find highest spending category with null check
    const highestCategory = categories.reduce((highest, current) => 
      current.amount > highest.amount ? current : highest
    , categories[0]) || { name: 'No Data', amount: 0 };

    // Calculate percentages for categories
    const categoriesWithPercentage = categories.map(cat => ({
      ...cat,
      percentage: totalSpent > 0 ? ((cat.amount / totalSpent) * 100).toFixed(1) : '0.0'
    }));

    // Calculate budget percentages with null check
    const budgetsWithPercentage = (budgets || []).map(budget => ({
      ...budget,
      percentage: budget.limit > 0 ? ((budget.amount / budget.limit) * 100).toFixed(1) : '0.0'
    }));

    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, sans-serif;
        padding: 24px;
        background-color: #f9fafb;
        color: #1f2937;
      }

      .header {
        text-align: center;
        margin-bottom: 32px;
      }

      .logo {
        width: 40px;
        height: 40px;
        vertical-align: middle;
        margin-right: 10px;
      }

      .title {
        font-size: 28px;
        font-weight: bold;
        color: #1e3a8a;
        display: inline-block;
        vertical-align: middle;
      }

      .subtitle {
        font-size: 16px;
        color: #6b7280;
        margin-top: 8px;
      }

      .section {
        background: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 24px;
      }

      .section-title {
        color: #2563eb;
        font-size: 20px;
        margin-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 4px;
      }

      .data-grid {
        display: grid;
        grid-template-columns: 1fr auto;
        row-gap: 10px;
        font-size: 16px;
      }

      .category {
        color: #4b5563;
      }

      .amount {
        font-weight: 600;
        color: #111827;
      }

      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAClUlEQVR4AbSUz2oTURTGvwlGfQpJQRFtu3ZX262PEBc2YBF0qegycanUpYJUiBvzCG5t3blurYhCi0+hRhx/35m5kxkS6gh2ON89955/37lnMunolJ85gvyjLuSHepJ/0j74WWI/bPj+tZ8GAUVuq6OvyvSQQiugW2IlbPgiBmNbqQgiMdMOiS46Ua7rOqPzAe+liaQuRDsRy6GNdBzksZD4wnvwILuim9lVvc8u6UfAe2z2ATk2cvT3JwhIuEdoF0wo/gwtZv8O5GDss1H60k2cY/OJSAQ3IirXy9DF0iuUNlV/UkymIqfuW7AvCKTL4evqQ2gWul1CzcsspsiZj2hYEkHD+D8PieBzFJ3qWuiTlllMkUMs72kdNEeJ3VIQ5HrrAy/7TujZcsx2F8wkUxGTcgrPEDWG5Aikd4dJSgTPOU1Bn4D76BC/B7ARB5bS12c7VS7nsA0ZsLoZF/evr7pNEGTL+kbCXYIs2xR6w8e0ln/RucCh1mzDuQ3k2MjhgL1HEy7uRkaYTDJEhwSBd3xYr0jcYh83YVx7+qXvgUx72PvAnW9FLIdSPJaxScBjbB5pD+K4RUWAQ5H4Wxchesr5AJjMOAgbvojBYaHIujXYrO1NgklxiwaBrb46RR7RzSo4W2I1bMuM0kGAgvVRHBPnzvHI41J65giSo4X2X4hv4OKLPsogakVAtx6BZ+2C/p+yNhYVt73qrxVBGe2RuGsf3d2AsSzq/JYDQIysLYGDDf86hhR2568p0hBu6gZ8g11i4mW3IiA4Oi6rjSjkcXlsJkw4wh8/TXQUR6sVgQNrJCZL43LRBNvs2yDWt3VaewJHk+ix+IsdcHaROkb4l4BtuAtpfYMiXKJAzB/tTuuoxqLa8wcAAP//NEC89gAAAAZJREFUAwDKIegxUWQwBQAAAABJRU5ErkJggg==" class="logo" />
      <span class="title">DeltaCoin</span>
      <div class="subtitle">Analytics Report</div>
    </div>

    <div class="section">
      <div class="section-title">Overview</div>
      <div class="data-grid">
        <div class="category">Total Spent:</div>
        <div class="amount">৳${totalSpent.toFixed(2)}</div>
        <div class="category">Highest Spending:</div>
        <div class="amount">${highestCategory.name}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Spending by Category</div>
      <div class="data-grid">
        ${categories.map(cat => `
          <div class="category">${cat.name}</div>
          <div class="amount">৳${cat.amount.toFixed(2)} (${cat.percentage}%)</div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Budget Status</div>
      <div class="data-grid">
        ${budgets.map(budget => `
          <div class="category">${budget.name}</div>
          <div class="amount">৳${budget.amount.toFixed(2)} / ৳${budget.limit.toFixed(2)} (${budget.percentage}% used)</div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      Generated on ${new Date().toLocaleString()}<br />
      DeltaCoin © 2025
    </div>
  </body>
</html>
`;


    const { uri } = await Print.printToFileAsync({
        
      html: htmlContent,
      width: 612, // US Letter width in points
      height: 792, // US Letter height in points
    });

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Analytics Report',
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert(
      'Error',
      'Failed to generate PDF report. Please try again.',
      [{ text: 'OK' }]
    );
  } finally {
    onLoadingChange(false);
  }
}; 