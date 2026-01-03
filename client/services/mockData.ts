
import { Order, OrderStatus } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'BZ-4021',
    customerName: 'Dawit Getachew',
    status: OrderStatus.PENDING,
    totalPrice: 1450,
    timestamp: '14:25',
    etaMinutes: 12,
    car: {
      model: 'Toyota Corolla',
      color: 'Silver',
      plate: 'AA 2-B 12345'
    },
    items: [
      { id: '1', name: 'Fresh Milk 1L', price: 85, quantity: 2, image: '', picked: false },
      { id: '2', name: 'White Bread', price: 35, quantity: 1, image: '', picked: false }
    ]
  },
  {
    id: 'BZ-4022',
    customerName: 'Sara Ahmed',
    status: OrderStatus.PREPARING,
    totalPrice: 2800,
    timestamp: '14:15',
    etaMinutes: 5,
    car: {
      model: 'Hyundai Atos',
      color: 'White',
      plate: 'AA 2-A 88990'
    },
    items: [
      { id: '3', name: 'Premium Coffee 500g', price: 450, quantity: 1, image: '', picked: true }
    ]
  },
  {
    id: 'BZ-4023',
    customerName: 'Yonas Tadesse',
    status: OrderStatus.READY,
    totalPrice: 620,
    timestamp: '14:02',
    etaMinutes: 2,
    car: {
      model: 'Suzuki Dzire',
      color: 'Dark Grey',
      plate: 'AA 2-C 44556'
    },
    items: [
      { id: '4', name: 'Local Eggs (Dozen)', price: 180, quantity: 2, image: '', picked: true }
    ]
  }
];
