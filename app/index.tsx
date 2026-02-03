import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { AccountService, Account } from "@/features/accounts";
import { CategoryService, Category } from "@/features/categories";
import { TransactionService, Transaction } from "@/features/transactions";
import { AccountType, TransactionType } from "@/shared/types";
import { formatCurrency } from "@/shared/utils";
import { resetDatabase } from "@/db";

// Services instantiated outside component to avoid recreating on each render
const accountService = new AccountService();
const categoryService = new CategoryService();
const transactionService = new TransactionService();

export default function TestScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const loadData = useCallback(async () => {
    try {
      const [accs, cats, txs] = await Promise.all([
        accountService.getAll(),
        categoryService.getAll(),
        transactionService.getAll(),
      ]);
      setAccounts(accs);
      setCategories(cats);
      setTransactions(txs);
      log(`Loaded: ${accs.length} accounts, ${cats.length} categories, ${txs.length} transactions`);
    } catch (error) {
      log(`Error loading data: ${error}`);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Test: Create a new account
  const testCreateAccount = async () => {
    try {
      const account = await accountService.create({
        name: `Test Account ${Date.now()}`,
        type: AccountType.BANK,
        currency: "PEN",
        balance: 1000,
      });
      log(`✅ Created account: ${account.name} (${formatCurrency(account.balance)})`);
      await loadData();
    } catch (error) {
      log(`❌ Error creating account: ${error}`);
    }
  };

  // Test: Create a transaction
  const testCreateTransaction = async () => {
    try {
      const defaultAccount = await accountService.getDefault();
      if (!defaultAccount) {
        log("❌ No default account found");
        return;
      }

      const expenseCategories = await categoryService.getExpenseCategories();
      if (expenseCategories.length === 0) {
        log("❌ No expense categories found");
        return;
      }

      const balanceBefore = defaultAccount.balance;
      const amount = Math.floor(Math.random() * 100) + 10;

      await transactionService.create({
        type: TransactionType.EXPENSE,
        amount,
        description: `Test expense ${Date.now()}`,
        date: new Date().toISOString(),
        accountId: defaultAccount.id,
        categoryId: expenseCategories[0].id,
      });

      const updatedAccount = await accountService.getById(defaultAccount.id);
      const balanceAfter = updatedAccount?.balance ?? 0;

      log(`✅ Created EXPENSE: ${formatCurrency(amount)}`);
      log(`   Balance: ${formatCurrency(balanceBefore)} → ${formatCurrency(balanceAfter)}`);
      await loadData();
    } catch (error) {
      log(`❌ Error creating transaction: ${error}`);
    }
  };

  // Test: Create income transaction
  const testCreateIncome = async () => {
    try {
      const defaultAccount = await accountService.getDefault();
      if (!defaultAccount) {
        log("❌ No default account found");
        return;
      }

      const incomeCategories = await categoryService.getIncomeCategories();
      if (incomeCategories.length === 0) {
        log("❌ No income categories found");
        return;
      }

      const balanceBefore = defaultAccount.balance;
      const amount = Math.floor(Math.random() * 500) + 100;

      await transactionService.create({
        type: TransactionType.INCOME,
        amount,
        description: `Test income ${Date.now()}`,
        date: new Date().toISOString(),
        accountId: defaultAccount.id,
        categoryId: incomeCategories[0].id,
      });

      const updatedAccount = await accountService.getById(defaultAccount.id);
      const balanceAfter = updatedAccount?.balance ?? 0;

      log(`✅ Created INCOME: ${formatCurrency(amount)}`);
      log(`   Balance: ${formatCurrency(balanceBefore)} → ${formatCurrency(balanceAfter)}`);
      await loadData();
    } catch (error) {
      log(`❌ Error creating income: ${error}`);
    }
  };

  // Test: Get monthly summary
  const testMonthlySummary = async () => {
    try {
      const summary = await transactionService.getMonthSummary();
      log(`📊 Monthly Summary:`);
      log(`   Income: ${formatCurrency(summary.totalIncome)}`);
      log(`   Expenses: ${formatCurrency(summary.totalExpense)}`);
      log(`   Net: ${formatCurrency(summary.netBalance)}`);
      log(`   Transactions: ${summary.transactionCount}`);
    } catch (error) {
      log(`❌ Error getting summary: ${error}`);
    }
  };

  // Test: Get account summary
  const testAccountSummary = async () => {
    try {
      const summary = await accountService.getSummary();
      log(`💰 Account Summary:`);
      log(`   Total Balance: ${formatCurrency(summary.totalBalance)}`);
      log(`   Accounts: ${summary.accountCount}`);
      log(`   By type: BANK=${formatCurrency(summary.byType.BANK)}, CASH=${formatCurrency(summary.byType.CASH)}`);
    } catch (error) {
      log(`❌ Error getting account summary: ${error}`);
    }
  };

  // Clear logs
  const clearLogs = () => setLogs([]);

  // Delete last transaction
  const deleteLastTransaction = async () => {
    try {
      if (transactions.length === 0) {
        log("❌ No transactions to delete");
        return;
      }

      const lastTx = transactions[0];
      await transactionService.delete(lastTx.id);
      log(`🗑️ Deleted transaction: ${lastTx.description}`);
      await loadData();
    } catch (error) {
      log(`❌ Error deleting transaction: ${error}`);
    }
  };

  // Reset database with confirmation
  const handleResetDatabase = async () => {
    Alert.alert(
      "🗑️ Reset Database",
      "¿Estás seguro? Esto borrará TODOS los datos y creará datos frescos.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sí, Reset",
          style: "destructive",
          onPress: async () => {
            try {
              log("🔄 Resetting database...");
              await resetDatabase();
              log("✅ Database reset complete!");
              await loadData();
            } catch (error) {
              log(`❌ Error resetting database: ${error}`);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Database Test</Text>
        <Text style={styles.subtitle}>Pull to refresh data</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Current Data</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{accounts.length}</Text>
            <Text style={styles.statLabel}>Accounts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>
      </View>

      {/* Default Account */}
      {accounts.filter((a) => a.isDefault).map((account) => (
        <View key={account.id} style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Default Account</Text>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountBalance}>
            {formatCurrency(account.balance)}
          </Text>
          <Text style={styles.accountType}>{account.type}</Text>
        </View>
      ))}

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔬 Tests</Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.buttonBlue]}
            onPress={loadData}
          >
            <Text style={styles.buttonText}>Load Data</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonGreen]}
            onPress={testCreateAccount}
          >
            <Text style={styles.buttonText}>+ Account</Text>
          </Pressable>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.buttonRed]}
            onPress={testCreateTransaction}
          >
            <Text style={styles.buttonText}>+ Expense</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonGreen]}
            onPress={testCreateIncome}
          >
            <Text style={styles.buttonText}>+ Income</Text>
          </Pressable>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.buttonPurple]}
            onPress={testMonthlySummary}
          >
            <Text style={styles.buttonText}>Month Summary</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonPurple]}
            onPress={testAccountSummary}
          >
            <Text style={styles.buttonText}>Account Summary</Text>
          </Pressable>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.buttonOrange]}
            onPress={deleteLastTransaction}
          >
            <Text style={styles.buttonText}>Delete Last Tx</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonGray]}
            onPress={clearLogs}
          >
            <Text style={styles.buttonText}>Clear Logs</Text>
          </Pressable>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.buttonDanger]}
            onPress={handleResetDatabase}
          >
            <Text style={styles.buttonText}>🗑️ Reset Database</Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <View key={tx.id} style={styles.transactionRow}>
              <View>
                <Text style={styles.txDescription}>
                  {tx.description || "No description"}
                </Text>
                <Text style={styles.txDate}>
                  {new Date(tx.date).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  tx.type === TransactionType.INCOME
                    ? styles.txIncome
                    : styles.txExpense,
                ]}
              >
                {tx.type === TransactionType.INCOME ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Categories Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏷️ Categories ({categories.length})</Text>
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 8).map((cat) => (
            <View
              key={cat.id}
              style={[styles.categoryChip, { backgroundColor: cat.color + "20" }]}
            >
              <Text style={[styles.categoryText, { color: cat.color }]}>
                {cat.name}
              </Text>
            </View>
          ))}
          {categories.length > 8 && (
            <View style={[styles.categoryChip, styles.moreChip]}>
              <Text style={styles.moreText}>+{categories.length - 8} more</Text>
            </View>
          )}
        </View>
      </View>

      {/* Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Logs</Text>
        <View style={styles.logsContainer}>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>No logs yet. Run some tests!</Text>
          ) : (
            logs
              .slice(-10)
              .reverse()
              .map((logEntry, index) => (
                <Text key={index} style={styles.logEntry}>
                  {logEntry}
                </Text>
              ))
          )}
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#007AFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  accountBalance: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginVertical: 8,
  },
  accountType: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonBlue: {
    backgroundColor: "#007AFF",
  },
  buttonGreen: {
    backgroundColor: "#34C759",
  },
  buttonRed: {
    backgroundColor: "#FF3B30",
  },
  buttonPurple: {
    backgroundColor: "#AF52DE",
  },
  buttonOrange: {
    backgroundColor: "#FF9500",
  },
  buttonGray: {
    backgroundColor: "#8E8E93",
  },
  buttonDanger: {
    backgroundColor: "#DC3545",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  txDescription: {
    fontSize: 14,
    color: "#333",
  },
  txDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  txIncome: {
    color: "#34C759",
  },
  txExpense: {
    color: "#FF3B30",
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreChip: {
    backgroundColor: "#f0f0f0",
  },
  moreText: {
    fontSize: 12,
    color: "#666",
  },
  logsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  logEntry: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#00ff00",
    marginBottom: 4,
  },
  footer: {
    height: 40,
  },
});
