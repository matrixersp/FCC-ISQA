/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const { expect } = require('chai');

const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const Thread = require('../models/thread');

const { ObjectId } = mongoose.Types;

require('dotenv').config();

mongoose.connect(
  process.env.LOCAL_DB,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  err => {
    if (!err) console.log('Database connected!');
  }
);

module.exports = app => {
  const validateThread = thread => {
    const schema = Joi.object({
      board: Joi.string().required(),
      text: Joi.string().required(),
      delete_password: Joi.string().required()
    });
    return schema.validate(thread, { abortEarly: false, allowUnknown: true });
  };

  const validateReply = reply => {
    const schema = Joi.object({
      text: Joi.string().required(),
      delete_password: Joi.string().required()
    });
    return schema.validate(reply, { abortEarly: false, allowUnknown: true });
  };

  app
    .route('/api/threads/:board')
    // --------- GET ROUTE ---------
    .get(async (req, res) => {
      const BUMPED_THREADS_NUMBER = 10;
      const { board } = req.params;

      try {
        const docs = await Thread.find({ board }, { replies: { $slice: -3 } })
          .sort({ bumped_on: -1 })
          .limit(BUMPED_THREADS_NUMBER)
          .select({
            __v: 0,
            reported: 0,
            delete_password: 0,
            'replies.reported': 0,
            'replies.delete_password': 0
          });
        return res.status(200).json(docs);
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })
    // --------- POST ROUTE ---------
    .post(async (req, res) => {
      const { board } = req.params;
      const { delete_password } = req.body;

      const { error } = validateThread({ ...req.body, board });
      if (error) {
        let errMsg = 'Errors:\n';
        error.details.forEach(e => (errMsg += `${e.message}\n`));
        return res.status(400).send(errMsg);
      }

      const hash = bcrypt.hashSync(delete_password, 12);

      const thread = Thread({
        _id: new ObjectId(),
        board: req.params.board,
        text: req.body.text,
        delete_password: hash
      });

      try {
        const doc = await thread.save();
        if (doc) return res.redirect(`/b/${board}`);
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })
    // --------- DELETE ROUTE ---------
    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id: _id, delete_password } = req.body;

      if (!ObjectId.isValid(_id))
        return res.status(400).send('"_id" is not valid');

      try {
        const doc = await Thread.findOne({ _id, board });

        if (!doc) return res.status(400).send('Reply not found');

        if (!bcrypt.compareSync(delete_password, doc.delete_password))
          return res.status(400).send('Incorrect password');

        await doc.remove();
        return res.status(200).send('Thread deleted successfully');
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })
    // --------- PATCH ROUTE ---------
    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id: _id } = req.body;

      if (!ObjectId.isValid(_id))
        return res.status(400).send('"_id" is not valid');

      try {
        const doc = await Thread.findOneAndUpdate(
          { _id, board },
          { $set: { reported: true } },
          { new: true }
        );
        if (!doc) return res.status(400).send('Thread not found');
        return res.status(200).send('Thread reported successfully');
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    });

  app
    .route('/api/replies/:board')
    // --------- GET ROUTE ---------
    .get(async (req, res) => {
      const { thread_id: _id } = req.query;

      if (!ObjectId.isValid(_id))
        return res.status(400).send('"thread_id" is not valid');

      try {
        const doc = await Thread.findById(_id).select({
          __v: 0,
          reported: 0,
          delete_password: 0,
          'replies.reported': 0,
          'replies.delete_password': 0
        });
        if (!doc) return res.status(400).send('Thread not Found');
        return res.status(200).json(doc);
      } catch (e) {
        console.error(e);
        return res.status(500).send('Server Internal Error');
      }
    })
    // --------- POST ROUTE ---------
    .post(async (req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      if (!ObjectId.isValid(thread_id))
        return res.status(400).send('"thread_id" is not valid');

      const { error } = validateReply(req.body);
      if (error) {
        let errMsg = 'Errors:\n';
        error.details.forEach(e => (errMsg += e.message));
        return res.status(400).send(errMsg);
      }

      const hash = bcrypt.hashSync(delete_password, 12);

      const reply = {
        _id: new ObjectId(),
        text: req.body.text,
        delete_password: hash
      };
      try {
        const doc = await Thread.findByIdAndUpdate(
          thread_id,
          {
            $push: { replies: reply },
            $inc: { repliesCount: 1 }
          },
          { new: true }
        );
        if (!doc) return res.status(400).send('Thread not found');
        return res.redirect(`/b/${board}/${thread_id}`);
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })
    // --------- DELETE ROUTE ---------
    .delete(async (req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;

      if (!ObjectId.isValid(thread_id))
        return res.status(400).send('"thread_id" is not valid');
      if (!ObjectId.isValid(reply_id))
        return res.status(400).send('"reply_id" is not valid');

      try {
        const doc = await Thread.findOne({
          _id: thread_id,
          'replies._id': reply_id
        });
        if (!doc) return res.status(400).send('Reply not found');
        doc.replies.forEach(async (reply, i) => {
          if (reply._id.toString() === reply_id) {
            if (bcrypt.compareSync(delete_password, reply.delete_password)) {
              doc.replies[i].text = '[deleted]';
              // doc.repliesCount -= 1;
              await doc.save();
              return res.status(200).send('Reply deleted successfully');
            }
            return res.status(400).send('Incorrect password');
          }
        });
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Status Error');
      }
    })
    // --------- PATCH ROUTE ---------
    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      if (!ObjectId.isValid(thread_id))
        return res.status(400).send('"thread_id" is not valid');
      if (!ObjectId.isValid(reply_id))
        return res.status(400).send('"reply_id" is not valid');

      try {
        const doc = await Thread.findOneAndUpdate(
          { _id: thread_id, board, 'replies._id': reply_id },
          { $set: { 'replies.$.reported': true } },
          { new: true }
        );
        if (doc) return res.status(200).send('Reply reported successfully');
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    });
};
