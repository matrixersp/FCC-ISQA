/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const mongoose = require('mongoose');
const https = require('https');

const AddressLog = require('../models/addressLog');
const Stock = require('../models/stock');

require('dotenv').config();

mongoose.connect(
  process.env.LOCAL_DB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (!err) console.log('Database connected');
  }
);

module.exports = app => {
  const ONE_DAY = 24 * 60 * 60 * 1000;

  app.use((req, res, next) => {
    const q = req.query;
    for (const key in q) {
      if (q[key] === 'true') q[key] = true;
      else if (q[key] === 'false') q[key] = false;
    }
    next();
  });

  const makeHttpRequest = (stockTicker, like, ip, res) => {
    return new Promise((resolve, reject) => {
      https
        .get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockTicker}&apikey=${process.env.API_KEY}`,
          response => {
            response.on('data', async d => {
              const data = JSON.parse(d.toString());

              if (!data['Global Quote'])
                return res.status(400).send(data['Error Message']);

              if (like) {
                const foundStock = await Stock.findOne({ stockTicker });

                if (!foundStock) {
                  const stock = new Stock({ stockTicker, likes: like });
                  const addressLog = new AddressLog({ ip, stockTicker });
                  await Promise.all([stock.save(), addressLog.save()]);
                }
                const foundLog = await AddressLog.find({ ip, stockTicker });

                if (!foundLog) {
                  const addressLog = new AddressLog({ ip, stockTicker });
                  foundStock.likes += like;
                  await Promise.all([addressLog.save(), foundStock.save()]);
                } else if (foundLog.time < Date.now() - ONE_DAY) {
                  foundLog.time = Date.now();
                  foundStock.likes += like;
                  await Promise.all([foundLog.save(), foundStock.save()]);
                }
              }
              resolve(data['Global Quote']['05. price']);
            });
          }
        )
        .on('error', err => {
          console.log(`Error: ${err.message}`);
        });
    });
  };

  app.route('/api/stock-prices').get(async (req, res) => {
    const like = Number(req.query.like) || 0;
    let stockTicker = req.query.stock;
    const { ip } = req;

    if (typeof stockTicker === 'string') {
      stockTicker = stockTicker.toUpperCase();
      const price = await makeHttpRequest(stockTicker, like, ip, res);
      const doc = await Stock.findOne({ stockTicker });
      return res.status(200).json({
        stockData: {
          stock: stockTicker,
          price,
          likes: doc ? doc.likes : 0
        }
      });
    }
    if (stockTicker.constructor === Array) {
      stockTicker[0] = stockTicker[0].toUpperCase();
      stockTicker[1] = stockTicker[1].toUpperCase();

      const [price1, price2] = await Promise.all([
        makeHttpRequest(stockTicker[0], like, ip, res),
        makeHttpRequest(stockTicker[1], like, ip, res)
      ]);

      const [doc1, doc2] = await Promise.all([
        Stock.findOne({ stockTicker: stockTicker[0] }),
        Stock.findOne({ stockTicker: stockTicker[1] })
      ]);

      let relLikes1 = 0;
      let relLikes2 = 0;

      if (doc1 && doc2) {
        relLikes1 = doc1.likes - doc2.likes;
        relLikes2 = -relLikes1;
      } else if (doc1) {
        relLikes1 = doc1.likes;
        relLikes2 = -relLikes1;
      } else if (doc2) {
        relLikes2 = doc2.likes;
        relLikes1 = -relLikes2;
      }
      return res.status(200).json({
        stockData: [
          {
            stock: stockTicker[0],
            price: price1,
            rel_likes: relLikes1
          },
          {
            stock: stockTicker[1],
            price: price2,
            rel_likes: relLikes2
          }
        ]
      });
    }
  });
};
// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
