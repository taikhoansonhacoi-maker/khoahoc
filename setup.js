const fs = require('fs');

fs.writeFileSync('data/courses.ts', `export interface Lesson {
  id: number;
  title: string;
  duration: string;
}

export interface Course {
  id: number;
  title: string;
  category: string;
  price: number;
  origPrice: number;
  icon: string;
  image: string;
  color: string;
  tag: 'hot' | 'new';
  description: string;
  comingSoon: boolean;
  lessons: Lesson[];
}

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Xây kênh 1K Follow nhanh',
    category: 'TikTok',
    price: 99000,
    origPrice: 199000,
    icon: '📱',
    image: '/images/course1.png',
    color: '#f97316',
    tag: 'hot',
    comingSoon: false,
    description: 'Bí quyết tăng 1000 follow TikTok trong 30 ngày, không cần quay phim chuyên nghiệp.',
    lessons: [
      { id: 1, title: 'Tạo kênh TikTok chuẩn & tối ưu tương tác', duration: '20:00' },
      { id: 2, title: 'Phân tích nội dung & copy ý tưởng viral từ TikTok', duration: '25:00' },
      { id: 3, title: 'Edit & tạo thành video hoàn chỉnh, đăng đúng tiêu đề, hashtag & kéo đề xuất', duration: '30:00' },
    ],
  },
  {
    id: 2,
    title: 'Ads TikTok cơ bản đến nâng cao',
    category: 'TikTok Ads',
    price: 299000,
    origPrice: 499000,
    icon: '🎯',
    image: '/images/course2.png',
    color: '#0891b2',
    tag: 'hot',
    comingSoon: true,
    description: 'Làm chủ TikTok Ads từ A-Z, tối ưu chi phí và tăng doanh thu hiệu quả.',
    lessons: [],
  },
  {
    id: 3,
    title: 'Ads Facebook từ A đến Z',
    category: 'Facebook Ads',
    price: 249000,
    origPrice: 399000,
    icon: '💙',
    image: '/images/course3.png',
    color: '#1d4ed8',
    tag: 'new',
    comingSoon: true,
    description: 'Chạy quảng cáo Facebook hiệu quả, tối ưu ROAS và scale doanh thu.',
    lessons: [],
  },
  {
    id: 4,
    title: 'Content Marketing tổng thể',
    category: 'Marketing',
    price: 199000,
    origPrice: 350000,
    icon: '✍️',
    image: '/images/course4.png',
    color: '#7c3aed',
    tag: 'new',
    comingSoon: true,
    description: 'Xây dựng chiến lược content bài bản, tạo nội dung viral và thu hút khách hàng.',
    lessons: [],
  },
];`, 'utf8');

fs.writeFileSync('store/useStore.ts', `import { create } from "zustand";
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
);`, 'utf8');

fs.writeFileSync('app/globals.css', '@import "tailwindcss";', 'utf8');

console.log('Xong!');