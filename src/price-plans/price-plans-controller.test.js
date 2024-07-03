const { meters } = require("../meters/meters");
const { pricePlanNames } = require("./price-plans");
const { readings } = require("../readings/readings");
const { compare, recommend, queryCostOfLastWeekUsage} = require("./price-plans-controller");

describe("price plans", () => {
    it("should compare usage cost for all price plans", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const expected = {
            pricePlanComparisons: [
                {
                    [pricePlanNames.PRICEPLAN0]: 0.26785 / 48 * 10,
                },
                {
                    [pricePlanNames.PRICEPLAN1]: 0.26785 / 48 * 2,
                },
                {
                    [pricePlanNames.PRICEPLAN2]: 0.26785 / 48 * 1,
                },
            ],
            smartMeterId: meters.METER0
        };

        const recommendation = compare(getReadings, {
            params: {
                smartMeterId: meters.METER0,
            },
            query: {}
        });

        expect(recommendation).toEqual(expected);
    });

    it("should recommend usage cost for all price plans by ordering from cheapest to expensive", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const expected = [
            {
                [pricePlanNames.PRICEPLAN2]: 0.26785 / 48 * 1,
            },
            {
                [pricePlanNames.PRICEPLAN1]: 0.26785 / 48 * 2,
            },
            {
                [pricePlanNames.PRICEPLAN0]: 0.26785 / 48 * 10,
            },
        ];

        const recommendation = recommend(getReadings, {
            params: {
                smartMeterId: meters.METER0,
            },
            query: {}
        });

        expect(recommendation).toEqual(expected);
    });

    it("should limit recommendation", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const expected = [
            {
                [pricePlanNames.PRICEPLAN2]: 0.26785 / 48 * 1,
            },
            {
                [pricePlanNames.PRICEPLAN1]: 0.26785 / 48 * 2,
            },
        ];

        const recommendation = recommend(getReadings, {
            params: {
                smartMeterId: meters.METER0,
            },
            query: {
                limit: 2
            }
        });

        expect(recommendation).toEqual(expected);
    });

  describe("queryCostOfLastWeekUsage", () => {
    it("should calculate cost of last week's usage for a given price plan", () => {
      const { getReadings } = readings({
        [meters.METER0]: [
          { time: Date.now() - 3 * 24 * 60 * 60 * 1000, reading: 0.26785 },
          { time: Date.now() - 4 * 24 * 60 * 60 * 1000, reading: 0.26785 },
          { time: Date.now() - 5 * 24 * 60 * 60 * 1000, reading: 0.26785 },
        ],
      });

      const expected = {
        smartMeterId: meters.METER0,
        pricePlanName: pricePlanNames.PRICEPLAN0,
        cost: 0.26785 * 48 * 10,
      };

      const result = queryCostOfLastWeekUsage(getReadings, {
        params: {
          smartMeterId: meters.METER0,
          pricePlanName: pricePlanNames.PRICEPLAN0,
        },
      });

      expect(result).toEqual(expected);
    });

    it("should return 0 if there are no readings for the last week", () => {
      const { getReadings } = readings({
        [meters.METER0]: [],
      });

      const result = queryCostOfLastWeekUsage(getReadings, {
        params: {
          smartMeterId: meters.METER0,
          pricePlanName: pricePlanNames.PRICEPLAN0,
        },
      });

      expect(result).toBe(0);
    });

    it("should throw an error if pricePlanName is not provided", () => {
      const { getReadings } = readings({
        [meters.METER0]: [
          { time: Date.now() - 3 * 24 * 60 * 60 * 1000, reading: 0.26785 },
        ],
      });

      expect(() => {
        queryCostOfLastWeekUsage(getReadings, {
          params: {
            smartMeterId: meters.METER0,
          },
        });
      }).toThrow("pricePlanName is required");
    });
  });
});
