/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  // test('#example Test GET /api/books', function(done) {
  //   chai
  //     .request(server)
  //     .get('/api/books')
  //     .end(function(err, res) {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(
  //         res.body[0],
  //         'commentcount',
  //         'Books in array should contain commentcount'
  //       );
  //       assert.property(
  //         res.body[0],
  //         'title',
  //         'Books in array should contain title'
  //       );
  //       assert.property(
  //         res.body[0],
  //         '_id',
  //         'Books in array should contain _id'
  //       );
  //       done();
  //     });
  // });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite('Routing tests', function() {
    suite(
      'POST /api/books with title => create book object/expect book object',
      function() {
        test('Test POST /api/books with title', function(done) {
          chai
            .request(server)
            .post('/api/books')
            .send({
              title: 'Book Title'
            })
            .end((err, res) => {
              assert.equal(res.status, 201);
              assert.equal(res.body.title, 'Book Title');
              assert.property(res.body, '_id', 'Book should contain _id');
              assert.property(res.body, 'title', 'Book should contain title');
              assert.notProperty(
                res.body,
                'comments',
                'Book should not contain comments'
              );
              done();
            });
        });

        test('Test POST /api/books with no title given', function(done) {
          chai
            .request(server)
            .post('/api/books')
            .send()
            .end((err, res) => {
              assert.equal(res.status, 400);
              assert.equal(res.text, '"title" is required');
              assert.isEmpty(res.body);
              done();
            });
        });
      }
    );

    suite('GET /api/books => array of books', function() {
      test('Test GET /api/books', function(done) {
        chai
          .request(server)
          .get('/api/books')
          .send()
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], 'commentcount');
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function() {
      test('Test GET /api/books/[id] with id not in db', function(done) {
        chai
          .request(server)
          .get('/api/books/5d775eb54af00062ba76add7')
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'No book found');
            assert.isEmpty(res.body);
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done) {
        chai
          .request(server)
          .get('/api/books/5d77f812dbc8ef32a6ec6165')
          .end((err, res) => {
            console.log(
              '> Should give a valid id in order for the test to pass <'
            );
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.isArray(res.body.comments);
            done();
          });
      });
    });

    suite(
      'POST /api/books/[id] => add comment/expect book object with id',
      function() {
        test('Test POST /api/books/[id] with comment', function(done) {
          chai
            .request(server)
            .post('/api/books/5d77f812dbc8ef32a6ec6165')
            .send({
              comment: 'This is a comment'
            })
            .end((err, res) => {
              console.log(
                '> Should give a valid id in order for the test to pass <'
              );
              assert.equal(res.status, 201);
              assert.property(res.body, '_id');
              assert.property(res.body, 'title');
              assert.isArray(res.body.comments);
              assert.isString(res.body.comments[0]);
              done();
            });
        });
      }
    );
  });
});
