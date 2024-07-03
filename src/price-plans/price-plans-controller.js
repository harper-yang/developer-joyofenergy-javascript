const { pricePlans } = require("./price-plans");
const { usageForAllPricePlans, average, timeElapsedInHours} = require("../usage/usage");
const CustomError = require("../error/CustomError");

const recommend = (getReadings, req) => {
    const meter = req.params.smartMeterId;
    const pricePlanComparisons = usageForAllPricePlans(pricePlans, getReadings(meter)).sort((a, b) => extractCost(a) - extractCost(b))
    if("limit" in req.query) {
        return pricePlanComparisons.slice(0, req.query.limit);
    }
    return pricePlanComparisons;
};

const extractCost = (cost) => {
    const [, value] = Object.entries(cost).find( ([key]) => key in pricePlans)
    return value
}

const compare = (getData, req) => {
    const meter = req.params.smartMeterId;
    const pricePlanComparisons = usageForAllPricePlans(pricePlans, getData(meter));
    return {
        smartMeterId: req.params.smartMeterId,
        pricePlanComparisons,
    };
};

const queryCostOfLastWeekUsage = (getReadings, req) => {
  // 1. Extract the smartMeterId and pricePlanId from the request parameters
  const smartMeterId = req.params.smartMeterId;
  const pricePlanName = req.params.pricePlanName
  // throw error if pricePlanId is not provided
  if (!pricePlans[pricePlanName]) {
    throw new CustomError(400, "pricePlanName is required");
  }

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  // 2. get all last week's readings for the smartMeterId
  const lastWeekReadings = getReadings(smartMeterId).filter(reading => {
    // get last week time
    return reading.time > lastWeek.getTime();
  });

  if (lastWeekReadings.length === 0) {
    return 0;
  }
  return {
    smartMeterId,
    pricePlanName,
    cost: average(lastWeekReadings) * timeElapsedInHours(lastWeekReadings) * pricePlans[pricePlanName].rate
  };
}

module.exports = { recommend, compare, queryCostOfLastWeekUsage };
