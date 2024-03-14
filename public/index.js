async function main() {

  const timeChartCanvas = document.querySelector('#time-chart');
  const highestPriceChartCanvas = document.querySelector('#highest-price-chart');
  const averagePriceChartCanvas = document.querySelector('#average-price-chart');

  let response = await fetch('https://api.twelvedata.com/time_series?symbol=GME,MSFT,DIS,BNTX&interval=1day&apikey=78fa4e797d5f4d6682cd0b5ceea5e0c8', {
    method: 'GET',
  })


  response.json()
    .then(result => {
      console.log(result)

      let GME = result.GME;
      let MSFT = result.MSFT;
      let DIS = result.DIS;
      let BNTX = result.BNTX;

      const stocks = [GME, MSFT, DIS, BNTX];
      console.log(stocks);

      const stockColors = stocks.map(stock => getColor(stock.meta.symbol));

      const highestValues = stocks.map(stock => Math.max(...stock.values.map(value => parseFloat(value.high))));


      function getColor(stock) {
        if (stock === "GME") {
          return 'rgba(61, 161, 61, 0.7)'
        }
        if (stock === "MSFT") {
          return 'rgba(209, 4, 25, 0.7)'
        }
        if (stock === "DIS") {
          return 'rgba(18, 4, 209, 0.7)'
        }
        if (stock === "BNTX") {
          return 'rgba(166, 43, 158, 0.7)'
        }
      };

      function getHighestPrice(stock) {
        let highestPrice = -Infinity;
        for (const value of stock.values) {
          const price = Math.max(...stock.values.map(value => parseFloat(value.high)));
          if (price > highestPrice) {
            highestPrice = price;
          }
        }
        return highestPrice;
      }

      function getColorOfHighestPrice(stock) {
        let highestPrice = -Infinity;
        let color = '';
        stocks.forEach(stock => {
          const price = Math.max(...stock.values.map(value => parseFloat(value.high)));
          if (price > highestPrice) {
            highestPrice = price;
            color = getColor(stock.meta.symbol);
          }
        });
        return color;
      }

      stocks.forEach(stock => stock.values.reverse());

      new Chart(timeChartCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: stocks[0].values.reverse().map(value => value.datetime),
          datasets: stocks.map(stock => ({
            label: stock.meta.symbol,
            data: stock.values.reverse().map(value => parseFloat(value.high)),
            backgroundColor: getColor(stock.meta.symbol),
            borderColor: getColor(stock.meta.symbol),
          }))
        }
      });

      new Chart(highestPriceChartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: stocks.map(stock => stock.meta.symbol),
          datasets: [{
            label: "Highest Price",
            data: stocks.map(stock => getHighestPrice(stock)),
            backgroundColor: stocks.map(stock => {
              if (stock == getHighestPrice(stock)) {
                return getColorOfHighestPrice(stock.meta.symbol)
              } else {
                return getColor(stock.meta.symbol)
              }
            }),
            borderColor: stocks.map(stock => getColor(stock)),
          }]
        },
        options: {
          legend: {
          labels: {
            fontColor: "red"
          }
        },
      }
    });

        new Chart(averagePriceChartCanvas.getContext('2d'), {
          type: 'pie',
          data: {
            labels: stocks.map(stock => stock.meta.symbol),
            datasets: stocks.map(stock => ({
              label: stock.meta.symbol,
              data: stocks.map(stock => {
                const averagePrice = stock.values.reduce((sum, value) => sum + parseFloat(value.high), 0) / stock.values.length;
                return averagePrice;
              }),
              backgroundColor: stockColors,
              borderColor: stockColors,
            }))
          },
          options: {
            lineTension: 0,
          }
        });
    });
};

main();              