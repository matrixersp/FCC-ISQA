const { ObjectId } = require('mongoose').Types;
const IssueHandler = require('../controllers/issueHandler');
const Issue = require('../models/issue.js');

require('dotenv').config();

const handler = new IssueHandler();

module.exports = app => {
  app
    .route('/api/issues/:project')

    .get(async (req, res) => {
      const { project } = req.params;
      const filters = req.query;

      try {
        const data = await Issue.find({ project, ...filters });
        if (data.length === 0) return res.status(200).send('No issues found');
        return res.status(200).send(data.map(handler.arrangeFields));
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })

    .post(async (req, res) => {
      const { project } = req.params;

      const { error } = handler.validateIssuePost({ ...req.body, project });
      if (error) {
        let errMsg = 'Errors:\n';
        for (const detail of error.details) {
          errMsg += `${detail.message}\n`;
        }
        return res.status(400).send(errMsg);
      }

      const filterdBody = handler.filterFields(req.body);
      const issue = new Issue({
        _id: new ObjectId(),
        ...filterdBody,
        project
      });

      try {
        let data = await issue.save();
        data = data.toObject();
        delete data.__v;

        return res.status(201).json(handler.arrangeFields(data));
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })

    .put(async (req, res) => {
      if (handler.isNotEmpty(req.body))
        return res.status(400).send('no updated field sent');

      const id = req.body._id;
      if (!id) return res.status(400).send('"_id" is required');
      if (!ObjectId.isValid(id))
        return res.status(400).send('"_id" is not valid');

      const updateOps = handler.filterFields(req.body);
      if (handler.isNotEmpty(updateOps))
        return res.status(400).send('no accepted field sent');

      const { error } = handler.validateIssuePut(updateOps);
      if (error) return res.status(400).send(error.details[0].message);

      try {
        const data = await Issue.findByIdAndUpdate(
          id,
          { $set: updateOps },
          { new: true }
        );
        if (!data) return res.status(400).send(`could not update ${id}`);
        return res.status(200).send('successfully updated');
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    })

    .delete(async (req, res) => {
      const id = req.body._id;
      if (!id) return res.status(404).send('_id error');

      try {
        const data = await Issue.findByIdAndDelete(id);

        if (!data) return res.status(404).send(`could not delete ${id}`);
        return res.status(200).send(`deleted ${id}`);
      } catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
      }
    });
};
