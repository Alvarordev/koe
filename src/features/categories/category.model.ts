import { CategoryType } from "@/shared/types";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
