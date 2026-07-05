import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Order {
  id: string
  order_date: string
  eta_date: string
  quantity: number
  total_price: number
  status: string
  seller_id: string
  item_id: string
  item?: any
  seller?: any
}

export interface Reminder {
  id: string
  order_id: string
  type: string
  title: string
  date?: string
  day_of_week?: number
  quarter_month?: number
  time: string
  is_active: boolean
}

export interface AppState {
  theme: 'frutiger-aero' | 'dark'
  defaultReminderTime: string
  defaultView: 'list' | 'grid'
  emailNotifications: boolean
  browserNotifications: boolean
  
  orderFilters: {
    status: string[]
    sellerId: string | null
    platform: string | null
    dateRange: { from: Date | null; to: Date | null } | null
  }
  reminderFilters: {
    type: string[]
    isActive: boolean | null
  }
  
  recentOrders: Order[]
  pendingReminders: Reminder[]
  
  isSidebarOpen: boolean
  isModalOpen: boolean
  modalType: 'order' | 'seller' | 'item' | 'payment' | 'reminder' | null
  
  // Actions
  setFilters: (filters: Partial<AppState['orderFilters']>) => void
  resetFilters: () => void
  toggleSidebar: () => void
  openModal: (type: AppState['modalType']) => void
  closeModal: () => void
  setTheme: (theme: 'frutiger-aero' | 'dark') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'frutiger-aero',
      defaultReminderTime: '08:00',
      defaultView: 'list',
      emailNotifications: true,
      browserNotifications: true,
      
      orderFilters: {
        status: [],
        sellerId: null,
        platform: null,
        dateRange: null
      },
      reminderFilters: {
        type: [],
        isActive: null
      },
      
      recentOrders: [],
      pendingReminders: [],
      
      isSidebarOpen: true,
      isModalOpen: false,
      modalType: null,
      
      setFilters: (filters) => set((state) => ({ 
        orderFilters: { ...state.orderFilters, ...filters } 
      })),
      
      resetFilters: () => set({ 
        orderFilters: { status: [], sellerId: null, platform: null, dateRange: null } 
      }),
      
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      openModal: (type) => set({ isModalOpen: true, modalType: type }),
      
      closeModal: () => set({ isModalOpen: false, modalType: null }),
      
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'retrocast-storage',
      // only persist these fields
      partialize: (state) => ({
        theme: state.theme,
        defaultReminderTime: state.defaultReminderTime,
        defaultView: state.defaultView,
        emailNotifications: state.emailNotifications,
        browserNotifications: state.browserNotifications,
        orderFilters: state.orderFilters
      }),
    }
  )
)
