const express = require("express");
const { readings } = require("./readings/readings");
const { readingsData } = require("./readings/readings.data");
const { read, store } = require("./readings/readings-controller");
const { recommend, compare, queryCostOfLastWeekUsage} = require("./price-plans/price-plans-controller");
const {errorHandler} = require("./middleware/error-handler");
const CustomError = require("./error/CustomError");

const app = express();
app.use(express.json());


const { getReadings, setReadings } = readings(readingsData);

app.get("/readings/read/:smartMeterId", (req, res, next) => {
  try {
    const result = read(getReadings, req);
    if (!result) {
      throw new CustomError(404, 'Meter not found');
    }
    res.send(result);
  } catch (e) {
    next(e);
  }
});

app.post("/readings/store", (req, res, next) => {
  try {
    const result = store(setReadings, req);
    if (!result) {
      throw new CustomError(500, 'Meter store failed');
    }
    res.send(result);
  } catch (e) {
    next(e);
  }
});

app.get("/price-plans/recommend/:smartMeterId", (req, res, next) => {
  try {
    res.send(recommend(getReadings, req));
  } catch (e) {
    next(e);
  }
});

app.get("/price-plans/compare-all/:smartMeterId", (req, res, next) => {
  try {
    res.send(compare(getReadings, req));
  } catch (e) {
    next(e);
  }
});

// view cost of last week's usage for a specific price plan
app.get("/price-plans/usage/last-week/:smartMeterId/:pricePlanName", (req, res, next) => {
  try {
    res.send(queryCostOfLastWeekUsage(getReadings, req));
  } catch (e) {
    next(e);
  }
});

app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port);

console.log(`🚀 app listening on port ${port}`);
