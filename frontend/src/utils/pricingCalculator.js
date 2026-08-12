import { GST_PERCENTAGE } from "./financeConfig";

export const TRUCK_RATES = Object.freeze({
  "Mini Truck (TATA Ace)": 22,
  "Pickup Truck": 28,
  "20ft / 22ft / 24ft Container": 48,
  "19 ft Open Truck": 50,
  "32 ft Container Truck (SXL)": 58,
  "32 ft Container Truck (MXL)": 62,
  "10 Tyre Truck": 62,
  "12 Tyre Truck": 70,
  "14 Tyre Truck": 78,
  "16 Tyre Truck": 86,
  "40 ft Trailer": 76,
  "45 ft Trailer": 84,
  "48 ft Trailer": 92,
  "53 ft Trailer": 100,
});

const TATA_ACE_LOCAL_SLABS = Object.freeze({
  "0-10": 600,
  "11-20": 1000,
  "21-30": 1400,
  "31-40": 1800,
  "41-50": 2300,
});

const PICKUP_LOCAL_SLABS = Object.freeze({
  "0-10": 800,
  "11-20": 1200,
  "21-30": 1600,
  "31-40": 2000,
  "41-50": 2500,
});

const MINIMUM_CHARGES_0_TO_50 = Object.freeze({
  "20ft / 22ft / 24ft Container": 5000,
  "19 ft Open Truck": 5500,
  "32 ft Container Truck (SXL)": 8000,
  "32 ft Container Truck (MXL)": 9000,
  "10 Tyre Truck": 10000,
  "12 Tyre Truck": 12000,
  "14 Tyre Truck": 14000,
  "16 Tyre Truck": 16000,
  "40 ft Trailer": 18000,
  "45 ft Trailer": 20000,
  "48 ft Trailer": 24000,
  "53 ft Trailer": 28000,
});

const MINIMUM_CHARGES_51_TO_100 = Object.freeze({
  "Mini Truck (TATA Ace)": 3500,
  "Pickup Truck": 4500,
  "20ft / 22ft / 24ft Container": 7500,
  "19 ft Open Truck": 8000,
  "32 ft Container Truck (SXL)": 12000,
  "32 ft Container Truck (MXL)": 14000,
  "10 Tyre Truck": 14000,
  "12 Tyre Truck": 16000,
  "14 Tyre Truck": 18000,
  "16 Tyre Truck": 20000,
  "40 ft Trailer": 22000,
  "45 ft Trailer": 24000,
  "48 ft Trailer": 28000,
  "53 ft Trailer": 32000,
});

const MINIMUM_CHARGES_101_TO_200 = Object.freeze({
  "Mini Truck (TATA Ace)": 4500,
  "Pickup Truck": 5500,
  "20ft / 22ft / 24ft Container": 9000,
  "19 ft Open Truck": 9500,
  "32 ft Container Truck (SXL)": 14000,
  "32 ft Container Truck (MXL)": 16000,
  "10 Tyre Truck": 16000,
  "12 Tyre Truck": 18000,
  "14 Tyre Truck": 20000,
  "16 Tyre Truck": 22000,
  "40 ft Trailer": 24000,
  "45 ft Trailer": 28000,
  "48 ft Trailer": 32000,
  "53 ft Trailer": 36000,
});

const MINIMUM_CHARGES_201_PLUS = Object.freeze({
  "Mini Truck (TATA Ace)": 5500,
  "Pickup Truck": 6500,
  "20ft / 22ft / 24ft Container": 11000,
  "19 ft Open Truck": 11500,
  "32 ft Container Truck (SXL)": 16000,
  "32 ft Container Truck (MXL)": 18000,
  "10 Tyre Truck": 18000,
  "12 Tyre Truck": 20000,
  "14 Tyre Truck": 22000,
  "16 Tyre Truck": 24000,
  "40 ft Trailer": 26000,
  "45 ft Trailer": 30000,
  "48 ft Trailer": 34000,
  "53 ft Trailer": 38000,
});

const getLocalSlabKey = (km) => {
  if (km <= 10) return "0-10";
  if (km <= 20) return "11-20";
  if (km <= 30) return "21-30";
  if (km <= 40) return "31-40";
  return "41-50";
};

export const getMinimumCharge = (truckType, distanceKm) => {
  const km = Number(distanceKm || 0);
  if (!truckType || km <= 0) return 0;

  if (km <= 50) {
    const rangeKey = getLocalSlabKey(km);

    if (truckType === "Mini Truck (TATA Ace)") {
      return TATA_ACE_LOCAL_SLABS[rangeKey] || 0;
    }

    if (truckType === "Pickup Truck") {
      return PICKUP_LOCAL_SLABS[rangeKey] || 0;
    }

    return MINIMUM_CHARGES_0_TO_50[truckType] || 0;
  }

  if (km <= 100) return MINIMUM_CHARGES_51_TO_100[truckType] || 0;
  if (km <= 200) return MINIMUM_CHARGES_101_TO_200[truckType] || 0;
  return MINIMUM_CHARGES_201_PLUS[truckType] || 0;
};

export const calculateTripPricing = (truckType, distanceKm) => {
  const km = Number(distanceKm || 0);
  const ratePerKm = Number(TRUCK_RATES[truckType] || 0);

  if (!truckType || km <= 0 || ratePerKm <= 0) {
    return {
      ratePerKm,
      minimumCharge: 0,
      baseAmount: 0,
      gstPercentage: GST_PERCENTAGE,
      gstAmount: 0,
      totalWithGST: 0,
    };
  }

  const calculatedFreight = Math.round(km * ratePerKm);
  const minimumCharge = getMinimumCharge(truckType, km);
  const baseAmount = Math.max(calculatedFreight, minimumCharge);
  const gstAmount = Math.round((baseAmount * GST_PERCENTAGE) / 100);

  return {
    ratePerKm,
    minimumCharge,
    baseAmount,
    gstPercentage: GST_PERCENTAGE,
    gstAmount,
    totalWithGST: baseAmount + gstAmount,
  };
};
