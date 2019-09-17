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
  suite('API ROUTING FOR /api/threads/:board', function() {
    suite('POST /api/threads/{board} => redirect to /b/{board}', function() {
      test('Every field filled in', function(done) {
        chai
          .request(server)
          .post('/api/threads/test')
          .send({ text: 'Thread text', delete_password: 'pwd' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isEmpty(res.body);
            assert.equal(res.req.path, '/b/test');
            done();
          });
      });
      test('Missing a field', function(done) {
        chai
          .request(server)
          .post('/api/threads/test')
          .send({ text: 'Thread text' })
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.isEmpty(res.body);
            assert.notEqual(res.req.path, '/b/test');
            done();
          });
      });
    });
    suite(
      'GET /api/threads/{board} => array of objects with thread data',
      function() {
        test('Return an array of threads for a specific board', function(done) {
          chai
            .request(server)
            .get('/api/threads/test')
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isArray(res.body);
              assert.isAtMost(res.body.length, 10);
              assert.property(res.body[0], '_id');
              assert.property(res.body[0], 'text');
              assert.property(res.body[0], 'replies');
              assert.isArray(res.body[0].replies);
              assert.isAtMost(res.body[0].replies.length, 3);
              assert.property(res.body[0], 'created_on');
              assert.property(res.body[0], 'bumped_on');
              done();
            });
        });
      }
    );

    suite('DELETE /api/threads/{board} => text', function() {
      test('No thread_id', function(done) {
        chai
          .request(server)
          .delete('/api/threads/test')
          .send({ delete_password: 'pwd' })
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.isEmpty(res.body);
            done();
          });
      });
      test('Valid thread_id', function(done) {
        chai
          .request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: '5d80a42f136c7a4d52a87f63',
            delete_password: 'pwd'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isEmpty(res.body);
            assert.equal(res.text, 'Thread deleted successfully');
            done();
          });
      });
    });

    suite('PUT /api/threads/{board} => text', function() {
      test('Report a thread', function(done) {
        chai
          .request(server)
          .put('/api/threads/test')
          .send({ thread_id: '5d809d6eb9b4d54640ef64b9' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isEmpty(res.body);
            assert.equal(res.text, 'Thread reported successfully');
            done();
          });
      });
    });

    suite('API ROUTING FOR /api/replies/:board', function() {
      suite(
        'POST /api/replies/{board} => redirect to /b/{board}/{thread_id}',
        function() {
          test('Every field filled in', function(done) {
            chai
              .request(server)
              .post('/api/replies/test')
              .send({
                thread_id: '5d809d07f8def445f1bddeb5',
                text: 'reply text',
                delete_password: 'pwd'
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isEmpty(res.body);
                assert.equal(res.req.path, '/b/test/5d809d07f8def445f1bddeb5');
                done();
              });
          });

          test('Missing a field', function(done) {
            chai
              .request(server)
              .post('/api/replies/test')
              .send({
                thread_id: '5d809d07f8def445f1bddeb5',
                text: 'Reply text'
              })
              .end((err, res) => {
                assert.equal(res.status, 400);
                assert.isEmpty(res.body);
                done();
              });
          });
        }
      );

      suite('GET /api/replies/{board} => object with thread data', function() {
        test('Return a thread for a specific board', function(done) {
          chai
            .request(server)
            .get('/api/replies/test')
            .query({ thread_id: '5d809d07f8def445f1bddeb5' })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.property(res.body, '_id');
              assert.property(res.body, 'text');
              assert.property(res.body, 'created_on');
              assert.property(res.body, 'bumped_on');
              assert.property(res.body, 'replies');
              assert.isArray(res.body.replies);
              assert.property(res.body.replies[0], '_id');
              assert.property(res.body.replies[0], 'text');
              done();
            });
        });
      });

      suite('PUT /api/replies/{board} => text', function() {
        test('Report a reply', function(done) {
          chai
            .request(server)
            .put('/api/replies/test')
            .send({
              thread_id: '5d809d07f8def445f1bddeb5',
              reply_id: '5d809d6fb9b4d54640ef64bb'
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isEmpty(res.body);
              assert.equal(res.text, 'Reply reported successfully');
              done();
            });
        });
      });

      suite('DELETE /api/replies/{board} => text', function() {
        test('Delete a reply', function(done) {
          chai
            .request(server)
            .delete('/api/replies/test')
            .send({
              thread_id: '5d809d07f8def445f1bddeb5',
              reply_id: '5d809e6631d36d471ca18f83',
              delete_password: 'pwd'
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isEmpty(res.body);
              assert.equal(res.text, 'Reply deleted successfully');
              done();
            });
        });
      });
    });
  });
});
