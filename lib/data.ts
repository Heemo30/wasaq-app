import { CustomerProfile } from './types'

export const defaultProfile: CustomerProfile = {
  name: 'خالد',
  phone: '0501234567',
  salary: 9000,
  currentBalance: 4000,
  daysUntilSalary: 10,
  commitments: [
    { id: 'c1', name: 'قسط السيارة',   amount: 1850, dueInDays: 5,  source: 'auto'      },
    { id: 'c2', name: 'فاتورة STC',    amount: 230,  dueInDays: 8,  source: 'recurring' },
    { id: 'c3', name: 'Netflix',        amount: 65,   dueInDays: 15, source: 'recurring' },
    { id: 'c4', name: 'Apple iCloud',   amount: 39,   dueInDays: 20, source: 'recurring' },
    { id: 'c5', name: 'Tabby',          amount: 420,  dueInDays: 10, source: 'deferred'  },
  ],
  transactions: [
    { id: 't1', merchant: 'LuLu Hypermarket', category: 'تسوق',           amount: 245,  date: daysAgo(1),  type: 'debit'  },
    { id: 't2', merchant: 'Noon',              category: 'تسوق إلكتروني', amount: 189,  date: daysAgo(2),  type: 'debit'  },
    { id: 't3', merchant: 'مطعم البيك',        category: 'مطاعم',          amount: 87,   date: daysAgo(3),  type: 'debit'  },
    { id: 't4', merchant: 'الراتب',            category: 'راتب',           amount: 9000, date: daysAgo(17), type: 'credit' },
  ],
  alerts: [
    { id: 'a1', message: 'وسق: صرفك الآمن اليومي 95 ريال',               type: 'info',    timestamp: hoursAgo(1),  read: false },
    { id: 'a2', message: 'لديك قسط سيارة بعد 5 أيام بقيمة 1,850 ريال',  type: 'warning', timestamp: hoursAgo(3),  read: false },
    { id: 'a3', message: 'اشتراكاتك هذا الشهر 104 ريال (نتفليكس + آبل)', type: 'info',    timestamp: hoursAgo(6),  read: true  },
    { id: 'a4', message: 'تمت عملية Noon بقيمة 189 ريال بنجاح',          type: 'success', timestamp: daysAgo(2),   read: true  },
  ],
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString()
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString()
}
