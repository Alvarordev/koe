import { CategoryType } from "@/shared/types";

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isSystem?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
  type?: CategoryType;
}
