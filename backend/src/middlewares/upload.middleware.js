// src/middlewares/upload.middleware.js
const multiparty = require("multiparty");

const upload = {
  any: () => (req, res, next) => {
    const form = new multiparty.Form({ maxFilesSize: 5 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) return next(err);

      req.body = { ...req.body };
      Object.keys(fields).forEach((key) => {
        req.body[key.trim()] = fields[key][0];
      });

      req.files = [];
      Object.keys(files).forEach((fieldname) => {
        files[fieldname].forEach((file) => {
          req.files.push({
            fieldname: fieldname.trim(), // trim ici
            originalname: file.originalFilename,
            mimetype: file.headers["content-type"],
            path: file.path,
            size: file.size,
          });
        });
      });

      next();
    });
  },
};

module.exports = upload;