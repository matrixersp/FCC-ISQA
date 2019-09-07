/*
*
*
*       Complete the handler logic below
*       
*       
*/

function ConvertHandler() {

  const unitsOfMeasurement = ['gal', 'l', 'mi', 'km', 'lbs', 'kg'];

  this.getNum = function (input) {
    const indexOfFirstChar = input.search(/[a-z]/i);
    const str = input.substring(0, indexOfFirstChar);

    if (str.length === 0) return 1;
    if (str.split('/').length > 2) return null;

    if (str.split('/').length === 1 && !isNaN(str)) {
      return Number.parseFloat(Number(str).toFixed(5));
    }

    const [numerator, denominator] = str.split('/');
    if (denominator === '' || isNaN(denominator)) return null;

    let result = numerator / denominator;
    return Number.parseFloat(result.toFixed(5));
  };

  this.getUnit = function (input) {
    const indexOfFirstChar = input.search(/[a-z]/i);
    const result = input.substring(indexOfFirstChar).trim();

    return unitsOfMeasurement.includes(result.toLowerCase()) ? result : null;
  };

  this.getReturnUnit = function (initUnit) {
    switch (initUnit.toLowerCase()) {
      case 'gal': return 'l'; break;
      case 'lbs': return 'kg'; break;
      case 'mi': return 'km'; break;
      case 'l': return 'gal'; break;
      case 'kg': return 'lbs'; break;
      case 'km': return 'mi'; break;
      default: return null;
    }
  };

  this.spellOutUnit = function (unit) {
    switch (unit.toLowerCase()) {
      case 'gal': return 'gallons'; break;
      case 'lbs': return 'pounds'; break;
      case 'mi': return 'miles'; break;
      case 'l': return 'liters'; break;
      case 'kg': return 'kilograms'; break;
      case 'km': return 'kilometers'; break;
      default: return null;
    }
  };

  this.convert = function (initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;

    let result;

    switch (initUnit.toLowerCase()) {
      case 'gal': result = initNum * galToL; break;
      case 'lbs': result = initNum * lbsToKg; break;
      case 'mi': result = initNum * miToKm; break;
      case 'l': result = initNum / galToL; break;
      case 'kg': result = initNum / lbsToKg; break;
      case 'km': result = initNum / miToKm; break;
      default: return null;
    }
    return Number.parseFloat(result.toFixed(5));
  };

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    initNum = Number.parseFloat(initNum.toFixed(5));

    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };

}

module.exports = ConvertHandler;
