import { CategoryRow } from "@/db/schema";
import { Category } from "./category.model";
import { CategoryType } from "@/shared/types";

export const CategoryMapper = {
  
  toDomain(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      type: row.type as CategoryType,
      isSystem: row.isSystem,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: CategoryRow[]): Category[] {
    return rows.map(this.toDomain);
  },
};
