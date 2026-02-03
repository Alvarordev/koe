import { CategoryType } from "@/shared/types";

export const DEFAULT_CATEGORIES = [
    {
    name: "Alimentación",
    icon: "restaurant",
    color: "#FF6B6B",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Transporte",
    icon: "directions-car",
    color: "#4ECDC4",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Entretenimiento",
    icon: "movie",
    color: "#45B7D1",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Compras",
    icon: "shopping-bag",
    color: "#96CEB4",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Salud",
    icon: "local-hospital",
    color: "#FF8A80",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Educación",
    icon: "school",
    color: "#B388FF",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Servicios",
    icon: "receipt",
    color: "#FFD93D",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Hogar",
    icon: "home",
    color: "#6BCB77",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Mascotas",
    icon: "pets",
    color: "#C9B1FF",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Regalos",
    icon: "card-giftcard",
    color: "#FFB6C1",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Suscripciones",
    icon: "subscriptions",
    color: "#FF9F43",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Otros gastos",
    icon: "more-horiz",
    color: "#A8A8A8",
    type: CategoryType.EXPENSE,
  },

    {
    name: "Salario",
    icon: "work",
    color: "#2ECC71",
    type: CategoryType.INCOME,
  },
  {
    name: "Freelance",
    icon: "laptop",
    color: "#3498DB",
    type: CategoryType.INCOME,
  },
  {
    name: "Inversiones",
    icon: "trending-up",
    color: "#9B59B6",
    type: CategoryType.INCOME,
  },
  {
    name: "Ventas",
    icon: "store",
    color: "#E67E22",
    type: CategoryType.INCOME,
  },
  {
    name: "Regalos recibidos",
    icon: "redeem",
    color: "#E91E63",
    type: CategoryType.INCOME,
  },
  {
    name: "Otros ingresos",
    icon: "add-circle",
    color: "#95A5A6",
    type: CategoryType.INCOME,
  },

    {
    name: "Transferencia",
    icon: "swap-horiz",
    color: "#607D8B",
    type: CategoryType.BOTH,
  },
  {
    name: "Ajuste",
    icon: "tune",
    color: "#795548",
    type: CategoryType.BOTH,
  },
] as const;
