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
  suite('POST /api/issues/{project} => object with issue data', function() {
    test('Every field filled in', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 201);
          assert.exists(res.body._id);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(
            res.body.created_by,
            'Functional Test - Every field filled in'
          );
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.equal(res.body.open, true);
          assert.exists(res.body.created_on);
          assert.exists(res.body.updated_on);
          done();
        });
    });

    test('Required fields filled in', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - required fields filled in'
        })
        .end((err, res) => {
          assert.equal(res.status, 201);
          assert.exists(res.body._id);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(
            res.body.created_by,
            'Functional Test - required fields filled in'
          );
          assert.isNotOk(res.body.assigned_to);
          assert.isNotOk(res.body.status_text);
          assert.equal(res.body.open, true);
          assert.exists(res.body.created_on);
          assert.exists(res.body.updated_on);
          done();
        });
    });

    test('Missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title'
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.isEmpty(res.body);
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => text', function() {
    test('No body', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send()
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.isEmpty(res.body);
          assert.equal(res.text, 'no updated field sent');
          done();
        });
    });

    test('One field to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: '5d766fe0f74bd8635090a258',
          issue_title: 'Updated Title'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });

    test('Multiple fields to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: '5d766fe0f74bd8635090a258',
          issue_title: 'New Title',
          issue_text: 'New issue text',
          open: false
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });
  });

  suite(
    'GET /api/issues/{project} => Array of objects with issue data',
    function() {
      test('No filter', done => {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
          });
      });

      test('One filter', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: true
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: true,
            issue_title: 'Title',
            created_by: 'Functional Test - required fields filled in'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
    }
  );

  suite('DELETE /api/issues/{project} => text', function() {
    test('No _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send()
        .end((err, res) => {
          assert.equal(res.status, 404);
          assert.equal(res.text, '_id error');
          done();
        });
    });

    test('Valid _id', function(done) {
      const _id = '5d76a07bff3c4d7ddd318750';
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id
        })
        .end((err, res) => {
          assert.oneOf(res.status, [200, 404]);
          console.log(res.text);
          assert.oneOf(res.text, [`deleted ${_id}`, `could not delete ${_id}`]);
          done();
        });
    });
  });
});
