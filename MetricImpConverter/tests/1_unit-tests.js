/*
*
*
*       FILL IN EACH UNIT TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]----
*       (if additional are added, keep them at the very end!)
*/

var chai = require('chai');
var assert = chai.assert;
var ConvertHandler = require('../controllers/convertHandler.js');

var convertHandler = new ConvertHandler();

suite('Unit Tests', function () {

  suite('Function convertHandler.getNum(input)', function () {

    test('Whole number input', function (done) {
      var input = '32L';
      assert.equal(convertHandler.getNum(input), 32);
      done();
    });

    test('Decimal Input', function (done) {
      const input = '41.5lbs';
      assert.equal(convertHandler.getNum(input), 41.5);
      done();
    });

    test('Fractional Input', function (done) {
      const input = '21/8kg';
      assert.equal(convertHandler.getNum(input), 21 / 8);
      done();
    });

    test('Fractional Input w/ Decimal', function (done) {
      const input = '7.5/1.5mi';
      assert.equal(convertHandler.getNum(input), 7.5 / 1.5);
      done();
    });

    test('Invalid Input (double fraction)', function (done) {
      const input = '6/3/2gal';
      assert.equal(convertHandler.getNum(input), null);
      done();
    });

    test('No Numerical Input', function (done) {
      const input = 'km';
      assert.equal(convertHandler.getNum(input), 1);
      done();
    });

  });

  suite('Function convertHandler.getUnit(input)', function () {

    test('For Each Valid Unit Inputs', function (done) {
      var input = ['gal', 'l', 'mi', 'km', 'lbs', 'kg', 'GAL', 'L', 'MI', 'KM', 'LBS', 'KG'];
      input.forEach(function (ele) {
        assert.equal(convertHandler.getUnit(ele), ele);
      });
      done();
    });

    test('Unknown Unit Input', function (done) {
      const input = ['ft', 'yard', 'inch', 'ounce', 'FT', 'YARD', 'INCH', 'OUNCE'];
      input.forEach(ele => {
        assert.equal(convertHandler.getUnit(ele), null);
      })
      done();
    });

  });

  suite('Function convertHandler.getReturnUnit(initUnit)', function () {

    test('For Each Valid Unit Inputs', function (done) {
      var input = ['gal', 'l', 'mi', 'km', 'lbs', 'kg'];
      var expect = ['l', 'gal', 'km', 'mi', 'kg', 'lbs'];
      input.forEach(function (ele, i) {
        assert.equal(convertHandler.getReturnUnit(ele), expect[i]);
      });
      done();
    });

  });

  suite('Function convertHandler.spellOutUnit(unit)', function () {
    const input = ['gal', 'l', 'mi', 'km', 'lbs', 'kg', 'GAL'];
    const expect = ['gallons', 'liters', 'miles', 'kilometers', 'pounds', 'kilograms', 'gallons'];

    test('For Each Valid Unit Inputs', function (done) {
      input.forEach((ele, i) => {
        assert.equal(convertHandler.spellOutUnit(ele), expect[i]);
      })
      done();
    });

  });

  suite('Function convertHandler.convert(num, unit)', function () {

    test('Gal to L', function (done) {
      var input = [5, 'gal'];
      var expected = 18.9271;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1); //0.1 tolerance
      done();
    });

    test('L to Gal', function (done) {
      const input = [7.5 / 4, 'l'];
      const expected = 0.4953;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Mi to Km', function (done) {
      const input = [5.5, 'mi']
      const expected = 8.8514;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Km to Mi', function (done) {
      const input = [18.2, 'km'];
      const expected = 11.3090;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Lbs to Kg', function (done) {
      const input = [14, 'lbs'];
      const expected = 6.3503;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Kg to Lbs', function (done) {
      const input = [7, 'kg'];
      const expected = 15.4324;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

  });

});