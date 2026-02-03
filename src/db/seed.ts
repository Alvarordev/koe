import { db } from "./client";
import { accounts, categories } from "./schema";
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from "@/shared/constants";
import { generateId, now } from "@/shared/utils";

async function isSeeded(): Promise<boolean> {
  const existingCategories = await db.select().from(categories).limit(1);
  return existingCategories.length > 0;
}

export async function seedDatabase(): Promise<void> {
  const alreadySeeded = await isSeeded();

  if (alreadySeeded) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");
  const timestamp = now();

    for (const category of DEFAULT_CATEGORIES) {
    await db.insert(categories).values({
      id: generateId(),
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isSystem: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);

    for (const account of DEFAULT_ACCOUNTS) {
    await db.insert(accounts).values({
      id: generateId(),
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      isDefault: account.isDefault,
      bankName: null,
      accountNumber: null,
      cci: null,
      autoFillEnabled: false,
      autoFillAmount: null,
      autoFillDay: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
  console.log(`Seeded ${DEFAULT_ACCOUNTS.length} accounts`);

  console.log("Database seeding complete!");
}

export async function forceSeedDatabase(): Promise<void> {
  console.log("Force seeding database - clearing existing data...");

    await db.delete(categories);
  await db.delete(accounts);

    const timestamp = now();

  for (const category of DEFAULT_CATEGORIES) {
    await db.insert(categories).values({
      id: generateId(),
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isSystem: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  for (const account of DEFAULT_ACCOUNTS) {
    await db.insert(accounts).values({
      id: generateId(),
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      isDefault: account.isDefault,
      bankName: null,
      accountNumber: null,
      cci: null,
      autoFillEnabled: false,
      autoFillAmount: null,
      autoFillDay: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  console.log("Force seeding complete!");
}
