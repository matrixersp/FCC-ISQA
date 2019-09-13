$(function() {
  $('#testForm1').submit(function(e) {
    e.preventDefault();
    $.ajax({
      url: '/api/stock-prices',
      type: 'get',
      data: $('#testForm1').serialize(),
      success(data) {
        $('#jsonResult').text(JSON.stringify(data));
      }
    });
  });

  $('#testForm2').submit(function(e) {
    e.preventDefault();
    $.ajax({
      url: '/api/stock-prices',
      type: 'get',
      data: $('#testForm2').serialize(),
      success(data) {
        $('#jsonResult').text(JSON.stringify(data));
      }
    });
  });
});
