export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const savedCards = [
  { id: 1, number: '**** **** **** 1234', type: 'Vietcombank', expiry: '12/25' },
  { id: 2, number: '**** **** **** 5678', type: 'Techcombank', expiry: '03/26' },
];

export const reservationData = {
  station: 'EcoCharge Station #42',
  district: 'District 1', 
  address: '123 Green Street, Ho Chi Minh City',
  chargingType: 'Fast Charging (50kW DC)',
  date: 'May 15, 2023',
  time: '10:00 AM - 11:30 AM (1.5 hours)',
  vehicle: 'Tesla Model 3 (ABC-1234)',
  chargingCost: 180000,
  serviceFee: 25000,
  tax: 20500
};