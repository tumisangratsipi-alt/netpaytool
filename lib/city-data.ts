// Netpaytool City Data — netpaytool.com
// Cost-of-living index, median salary, and state mapping per metro.
// COL index: 100 = national average. Source: C2ER 2024 / BLS OES 2024.

export interface CityData {
  name: string;
  state: string;
  stateCode: string;
  colIndex: number;         // cost-of-living index (100 = US average)
  medianSalary: number;     // BLS 2024 OES metro median annual wage
  localIncomeTax?: number;  // local income tax rate if applicable (e.g. NYC = 0.03648)
  localTaxName?: string;    // label for local tax (e.g. "NYC local income tax")
}

export const CITY_DATA: Record<string, CityData> = {
  "new-york-ny": {
    name: "New York City",
    state: "New York",
    stateCode: "NY",
    colIndex: 187,
    medianSalary: 71240,
    localIncomeTax: 0.03648,
    localTaxName: "NYC local income tax",
  },
  "los-angeles-ca": {
    name: "Los Angeles",
    state: "California",
    stateCode: "CA",
    colIndex: 167,
    medianSalary: 65490,
  },
  "chicago-il": {
    name: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    colIndex: 107,
    medianSalary: 60180,
  },
  "houston-tx": {
    name: "Houston",
    state: "Texas",
    stateCode: "TX",
    colIndex: 96,
    medianSalary: 55390,
  },
  "phoenix-az": {
    name: "Phoenix",
    state: "Arizona",
    stateCode: "AZ",
    colIndex: 103,
    medianSalary: 52870,
  },
  "philadelphia-pa": {
    name: "Philadelphia",
    state: "Pennsylvania",
    stateCode: "PA",
    colIndex: 101,
    medianSalary: 55120,
    localIncomeTax: 0.038398,
    localTaxName: "Philadelphia wage tax (residents)",
  },
  "san-antonio-tx": {
    name: "San Antonio",
    state: "Texas",
    stateCode: "TX",
    colIndex: 91,
    medianSalary: 47290,
  },
  "san-diego-ca": {
    name: "San Diego",
    state: "California",
    stateCode: "CA",
    colIndex: 151,
    medianSalary: 67810,
  },
  "dallas-tx": {
    name: "Dallas",
    state: "Texas",
    stateCode: "TX",
    colIndex: 103,
    medianSalary: 58340,
  },
  "san-jose-ca": {
    name: "San Jose",
    state: "California",
    stateCode: "CA",
    colIndex: 183,
    medianSalary: 97540,
  },
  "austin-tx": {
    name: "Austin",
    state: "Texas",
    stateCode: "TX",
    colIndex: 118,
    medianSalary: 65120,
  },
  "jacksonville-fl": {
    name: "Jacksonville",
    state: "Florida",
    stateCode: "FL",
    colIndex: 93,
    medianSalary: 47580,
  },
  "san-francisco-ca": {
    name: "San Francisco",
    state: "California",
    stateCode: "CA",
    colIndex: 209,
    medianSalary: 91350,
  },
  "columbus-oh": {
    name: "Columbus",
    state: "Ohio",
    stateCode: "OH",
    colIndex: 90,
    medianSalary: 50440,
  },
  "indianapolis-in": {
    name: "Indianapolis",
    state: "Indiana",
    stateCode: "IN",
    colIndex: 88,
    medianSalary: 49870,
  },
  "seattle-wa": {
    name: "Seattle",
    state: "Washington",
    stateCode: "WA",
    colIndex: 145,
    medianSalary: 79450,
  },
  "denver-co": {
    name: "Denver",
    state: "Colorado",
    stateCode: "CO",
    colIndex: 117,
    medianSalary: 63280,
  },
  "nashville-tn": {
    name: "Nashville",
    state: "Tennessee",
    stateCode: "TN",
    colIndex: 105,
    medianSalary: 52460,
  },
  "boston-ma": {
    name: "Boston",
    state: "Massachusetts",
    stateCode: "MA",
    colIndex: 162,
    medianSalary: 75920,
  },
  "miami-fl": {
    name: "Miami",
    state: "Florida",
    stateCode: "FL",
    colIndex: 123,
    medianSalary: 48390,
  },
  "atlanta-ga": {
    name: "Atlanta",
    state: "Georgia",
    stateCode: "GA",
    colIndex: 105,
    medianSalary: 58940,
  },
  "minneapolis-mn": {
    name: "Minneapolis",
    state: "Minnesota",
    stateCode: "MN",
    colIndex: 110,
    medianSalary: 62840,
  },
  "portland-or": {
    name: "Portland",
    state: "Oregon",
    stateCode: "OR",
    colIndex: 122,
    medianSalary: 60370,
  },
  "charlotte-nc": {
    name: "Charlotte",
    state: "North Carolina",
    stateCode: "NC",
    colIndex: 97,
    medianSalary: 56290,
  },
  "tampa-fl": {
    name: "Tampa",
    state: "Florida",
    stateCode: "FL",
    colIndex: 99,
    medianSalary: 50180,
  },
};

export const CITY_SLUGS = Object.keys(CITY_DATA);
