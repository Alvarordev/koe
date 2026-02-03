import { CategoryRepository } from "./category.repository";
import { Category } from "./category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.types";
import { CategoryType } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

export class CategoryService {
  constructor(private repo = new CategoryRepository()) {}

  async getAll(): Promise<Category[]> {
    return this.repo.getAll();
  }

  async getById(id: string): Promise<Category | null> {
    return this.repo.getById(id);
  }

  async getExpenseCategories(): Promise<Category[]> {
    return this.repo.getExpenseCategories();
  }

  async getIncomeCategories(): Promise<Category[]> {
    return this.repo.getIncomeCategories();
  }

  async getByType(type: CategoryType): Promise<Category[]> {
    return this.repo.getByType(type);
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    this.validateCategoryInput(data);
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    const category = await this.repo.getByIdOrThrow(id);

    if (category.isSystem) {
      throw new ValidationError("System categories cannot be modified");
    }

    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const category = await this.repo.getByIdOrThrow(id);

    if (category.isSystem) {
      throw new ValidationError("System categories cannot be deleted");
    }

    return this.repo.delete(id);
  }

  async validateExists(id: string): Promise<void> {
    const exists = await this.repo.exists(id);
    if (!exists) {
      throw new ValidationError(`Category with id '${id}' does not exist`);
    }
  }

  private validateCategoryInput(data: CreateCategoryInput): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Category name is required");
    }

    if (!data.icon || data.icon.trim().length === 0) {
      throw new ValidationError("Category icon is required");
    }

    if (!data.color || data.color.trim().length === 0) {
      throw new ValidationError("Category color is required");
    }

        if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      throw new ValidationError(
        "Category color must be a valid hex color (e.g., #FF5733)",
      );
    }
  }
}
