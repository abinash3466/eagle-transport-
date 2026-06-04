// trackingApi.js
export const verifyTracking = async (bookingId, otp) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp === '1234') resolve({ success: true, token: 'fake-token' });
      else reject({ message: 'Invalid OTP' });
    }, 500);
  });
};

export const getTrackingDetails = async (bookingId) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      bookingId,
      customer: 'Rajesh Kumar',
      route: 'Delhi to Mumbai',
      truckType: 'Heavy Truck',
      goodsType: 'Electronics',
      estimatedAmount: 25000,
      assignedDriver: 'Mohan Das',
      driverMobile: '+91 9876543210',
      currentLocation: 'Jaipur Highway Toll',
      lat: 26.9124,
      lng: 75.7873,
      lastUpdated: new Date().toISOString(),
      status: 'On The Way',
      timeline: [
        { status: 'Booking Received', time: '2 hours ago', completed: true },
        { status: 'Truck Assigned', time: '1 hour ago', completed: true },
        { status: 'On The Way', time: '15 mins ago', completed: true },
        { status: 'Delivered Successfully', time: null, completed: false }
      ]
    }), 500);
  });
};
