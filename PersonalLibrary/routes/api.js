/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const { expect } = require('chai');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Joi = require('@hapi/joi');
const Book = require('../models/book');

require('dotenv').config();

mongoose.set('useFindAndModify', false);
mongoose.connect(
  process.env.LOCAL_DB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (!err) console.log('Database connected');
  }
);

module.exports = function(app) {
  const validateBook = book => {
    const schema = Joi.object({
      title: Joi.string().required()
    });
    return schema.validate(book, { allowUnknown: true });
  };

  const validateComment = comment => {
    const schema = Joi.object({
      comment: Joi.string().required()
    });
    return schema.validate(comment, { allowUnknown: true });
  };

  app
    .route('/api/books')
    .get(async (req, res) => {
      try {
        const docs = await Book.find();
        if (docs.length === 0) return res.status(200).send('No books found');
        return res.status(200).json(
          docs.map(doc => ({
            _id: doc._id,
            title: doc.title,
            commentcount: doc.comments.length
          }))
        );
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })

    .post(async (req, res) => {
      const { error } = validateBook(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      const { title } = req.body;
      const book = new Book({ title, _id: new ObjectId() });

      try {
        const doc = await book.save();
        if (!doc) res.status(200).send('Could not add book');
        return res.status(201).json({
          _id: doc._id,
          title: doc.title
        });
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })

    .delete(async (req, res) => {
      try {
        const doc = await Book.deleteMany();

        if (!doc) return res.status(404).send('Could not delete books');
        return res.status(200).send('Complete delete successful');
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    });

  app
    .route('/api/books/:id')
    .get(async (req, res) => {
      const bookId = req.params.id;

      if (!ObjectId.isValid(bookId))
        return res.status(400).send('Not valid book id');

      try {
        const doc = await Book.findById(bookId);

        if (!doc) return res.status(400).send('No book found');
        return res.status(200).json({
          _id: doc._id,
          title: doc.title,
          comments: doc.comments
        });
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })

    .post(async (req, res) => {
      const bookId = req.params.id;
      if (!ObjectId.isValid(bookId))
        return res.status(400).send('Not valid book id');

      const { error } = validateComment(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      try {
        const doc = await Book.findByIdAndUpdate(
          bookId,
          { $push: { comments: req.body.comment } },
          { new: true }
        );

        if (!doc) return res.status(200).send('Could not add comment');
        return res.status(201).json({
          _id: doc._id,
          title: doc.title,
          comments: doc.comments
        });
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })

    .delete(async (req, res) => {
      const bookId = req.params.id;

      if (!ObjectId.isValid(bookId))
        return res.status(400).send('Not valid book id');

      try {
        const doc = await Book.findByIdAndDelete(bookId);
        if (!doc) return res.status(404).send(`Could not delete ${bookId}`);
        return res.status(200).send('Delete successful');
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    });
};
