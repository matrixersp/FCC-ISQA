const Joi = require('@hapi/joi');

module.exports = function() {
  const acceptedFields = [
    'issue_title',
    'issue_text',
    'created_by',
    'assigned_to',
    'status_text',
    'open',
    'project'
  ];

  this.validateIssuePost = body => {
    const schema = Joi.object({
      issue_title: Joi.string().required(),
      issue_text: Joi.string().required(),
      created_by: Joi.string().required(),
      assigned_to: Joi.string().allow(''),
      status_text: Joi.string().allow(''),
      project: Joi.string().required()
    });
    return schema.validate(body, { abortEarly: false, allowUnknown: true });
  };

  this.validateIssuePut = data => {
    const schema = Joi.object({
      issue_title: Joi.string(),
      issue_text: Joi.string(),
      created_by: Joi.string(),
      assigned_to: Joi.string(),
      status_text: Joi.string(),
      open: Joi.boolean(),
      project: Joi.string()
    });

    return schema.validate(data, { allowUnknown: true });
  };

  this.arrangeFields = data => ({
    _id: data._id,
    issue_title: data.issue_title,
    issue_text: data.issue_text,
    created_on: data.created_on,
    updated_on: data.updated_on,
    created_by: data.created_by,
    assigned_to: data.assigned_to,
    open: data.open,
    status_text: data.status_text
  });

  this.isNotEmpty = obj => {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
  };

  this.filterFields = body => {
    const updateOps = {};
    for (const [key, value] of Object.entries(body)) {
      if (acceptedFields.includes(key) && body[key] !== '')
        updateOps[key] = value;
    }
    return updateOps;
  };
};
