/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(0);
  suite('GET /api/stock-prices => stockData object', function() {
    test('1 stock', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function(err, res) {
          // complete this one too
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.typeOf(res.body.stockData.likes, 'number');
          done();
        });
    });

    test('1 stock with like', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.typeOf(res.body.stockData.likes, 'number');
          assert.equal(res.body.stockData.likes, '1');
          done();
        });
    });

    test('1 stock with like again (ensure likes arent double counted)', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.typeOf(res.body.stockData.likes, 'number');
          assert.equal(res.body.stockData.likes, '1');
          done();
        });
    });

    test('2 stocks', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          const { stockData } = res.body;
          assert.isArray(stockData);
          assert.property(stockData[0], 'stock');
          assert.property(stockData[0], 'price');
          assert.property(stockData[0], 'rel_likes');
          assert.property(stockData[1], 'stock');
          assert.property(stockData[1], 'price');
          assert.property(stockData[1], 'rel_likes');
          done();
        });
    });

    test('2 stocks with like', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'], like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          const { stockData } = res.body;
          assert.isArray(stockData);
          assert.property(stockData[0], 'stock');
          assert.property(stockData[0], 'price');
          assert.property(stockData[0], 'rel_likes');
          assert.property(stockData[1], 'stock');
          assert.property(stockData[1], 'price');
          assert.property(stockData[1], 'rel_likes');
          assert.equal(stockData[0].rel_likes, 0);
          assert.equal(stockData[1].rel_likes, 0);
          done();
        });
    });
  });
});
