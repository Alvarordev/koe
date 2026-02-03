import { eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { Category } from "./category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.types";
import { CategoryMapper } from "./category.mapper";
import { generateId, now } from "@/shared/utils";
import { NotFoundError } from "@/shared/errors";
import { CategoryType } from "@/shared/types";

export class CategoryRepository {
  
  async getAll(): Promise<Category[]> {
    const rows = await db.select().from(categories).orderBy(categories.name);
    return CategoryMapper.toDomainList(rows);
  }

  async getById(id: string): Promise<Category | null> {
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return rows[0] ? CategoryMapper.toDomain(rows[0]) : null;
  }

  async getByIdOrThrow(id: string): Promise<Category> {
    const category = await this.getById(id);
    if (!category) {
      throw new NotFoundError("Category", id);
    }
    return category;
  }

  async getByType(type: CategoryType): Promise<Category[]> {
    const rows = await db
      .select()
      .from(categories)
      .where(
        type === CategoryType.BOTH
          ? eq(categories.type, CategoryType.BOTH)
          : or(eq(categories.type, type), eq(categories.type, CategoryType.BOTH)),
      )
      .orderBy(categories.name);
    return CategoryMapper.toDomainList(rows);
  }

  async getExpenseCategories(): Promise<Category[]> {
    return this.getByType(CategoryType.EXPENSE);
  }

  async getIncomeCategories(): Promise<Category[]> {
    return this.getByType(CategoryType.INCOME);
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    const id = generateId();
    const timestamp = now();

    await db.insert(categories).values({
      id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type,
      isSystem: data.isSystem ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.getByIdOrThrow(id);
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    await this.getByIdOrThrow(id);

    await db
      .update(categories)
      .set({
        ...data,
        updatedAt: now(),
      })
      .where(eq(categories.id, id));

    return this.getByIdOrThrow(id);
  }

  async delete(id: string): Promise<void> {
    await this.getByIdOrThrow(id);
    await db.delete(categories).where(eq(categories.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const category = await this.getById(id);
    return category !== null;
  }
}
