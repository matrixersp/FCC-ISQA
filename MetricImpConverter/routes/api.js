/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ConvertHandler = require('../controllers/convertHandler.js');

module.exports = function (app) {

  var convertHandler = new ConvertHandler();

  app.route('/api/convert')
    .get(function (req, res) {

      var input = req.query.input;
      var initNum = convertHandler.getNum(input);
      var initUnit = convertHandler.getUnit(input);

      let msg = (!initNum && !initUnit) ? 'invalid number and unit'
        : !initNum ? 'invalid number'
          : !initUnit ? 'invalid unit' : '';

      if (msg) return res.status(200).send(msg);

      var returnNum = convertHandler.convert(initNum, initUnit);
      var returnUnit = convertHandler.getReturnUnit(initUnit);
      var toString = convertHandler.getString(initNum, initUnit, returnNum, returnUnit);

      res.status(200).json({ initNum, initUnit, returnNum, returnUnit, string: toString });
    });

};
