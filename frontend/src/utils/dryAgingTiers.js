// Dry Aging Tiers Configuration
export const DRY_AGING_TIERS = [
  {
    id: 'none',
    days: 0,
    name: 'No Dry Aging',
    upcharge: 0,
    description: 'Fresh cut, no aging'
  },
  {
    id: '17day',
    days: 17,
    name: '17-Day Dry-Aged',
    upcharge: 15,
    description: 'Enhanced tenderness with light nutty flavor'
  },
  {
    id: '25day',
    days: 25,
    name: '25-Day Dry-Aged',
    upcharge: 20,
    description: 'Balanced richness and deeper beef character'
  },
  {
    id: '30day',
    days: 30,
    name: '30-Day Dry-Aged',
    upcharge: 25,
    description: 'Most Popular — ideal balance of tenderness + umami',
    popular: true
  },
  {
    id: '40day',
    days: 40,
    name: '40-Day Dry-Aged',
    upcharge: 30,
    description: 'Bold, complex steakhouse-level flavor'
  },
  {
    id: '45day',
    days: 45,
    name: '45-Day Dry-Aged',
    upcharge: 35,
    description: 'Deep intensity, premium reserve profile'
  },
  {
    id: '60day',
    days: 60,
    name: '60+ Day Dry-Aged Reserve',
    upcharge: null,
    description: 'Exclusive release cut',
    contactOnly: true
  }
];

export const getDryAgingTier = (days) => {
  return DRY_AGING_TIERS.find(tier => tier.days === days) || DRY_AGING_TIERS[0];
};

export const calculateDryAgingPrice = (basePrice, tierDays) => {
  const tier = getDryAgingTier(tierDays);
  if (!tier || tier.upcharge === null) return basePrice;
  return basePrice + tier.upcharge;
};
