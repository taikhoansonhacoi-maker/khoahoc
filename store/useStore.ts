import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  email: string;
  name: string;
  password: string;
}

interface StoreState {
  user: User | null;
  wallet: number;
  bought: number[];
  users: Record<string, User & { wallet: number; bought: number[] }>;
  login: (email: string, password: string) => string | null;
  register: (email: string, password: string, name: string) => string | null;
  logout: () => void;
  topup: (amount: number) => void;
  buyCourse: (courseId: number, price: number) => string | null;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      wallet: 0,
      bought: [],
      users: {},

      login: (email, password) => {
        const { users } = get();
        const u = users[email];
        if (!u) return "Email chưa được đăng ký!";
        if (u.password !== password) return "Mật khẩu không đúng!";
        set({ user: { email, name: u.name, password }, wallet: u.wallet, bought: u.bought });
        return null;
      },

      register: (email, password, name) => {
        const { users } = get();
        if (users[email]) return "Email đã được đăng ký!";
        const newUser = { email, name, password, wallet: 50000, bought: [] };
        set((s) => ({
          users: { ...s.users, [email]: newUser },
          user: { email, name, password },
          wallet: 50000,
          bought: [],
        }));
        return null;
      },

      logout: () => set({ user: null, wallet: 0, bought: [] }),

      topup: (amount) => {
        const { user } = get();
        if (!user) return;
        set((s) => {
          const newWallet = s.wallet + amount;
          return {
            wallet: newWallet,
            users: { ...s.users, [user.email]: { ...s.users[user.email], wallet: newWallet } },
          };
        });
      },

      buyCourse: (courseId, price) => {
        const { wallet, bought, user } = get();
        if (bought.includes(courseId)) return "Bạn đã mua khóa học này rồi!";
        if (wallet < price) return "Số dư ví không đủ!";
        set((s) => {
          const newWallet = s.wallet - price;
          const newBought = [...s.bought, courseId];
          return {
            wallet: newWallet,
            bought: newBought,
            users: {
              ...s.users,
              [user.email]: { ...s.users[user.email], wallet: newWallet, bought: newBought },
            },
          };
        });
        return null;
      },
    }),
    { name: "khoahoc-store" }
  )
);