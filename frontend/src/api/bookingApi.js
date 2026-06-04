import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Mocks for now
export const createBooking = async (data) => {
  return new Promise((resolve) => setTimeout(() => resolve({ id: 'BKG' + Math.floor(Math.random() * 10000), trackingOtp: '1234', success: true }), 1000));
};

export const getRecentBookings = async () => {
  return new Promise((resolve) => setTimeout(() => resolve([
    { id: 'BKG8921', customer: 'Rajesh Kumar', route: 'Delhi to Mumbai', truck: 'Heavy Truck', estimatedAmount: 25000, status: 'On The Way' },
    { id: 'BKG3412', customer: 'Amit Singh', route: 'Pune to Bangalore', truck: 'Mini Truck', estimatedAmount: 8500, status: 'Booking Received' }
  ]), 500));
};

export const calculateEstimate = async (route, truckType) => {
  return new Promise((resolve) => setTimeout(() => resolve({ amount: Math.floor(Math.random() * 15000) + 5000 }), 300));
};
