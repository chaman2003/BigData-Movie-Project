import app from '../server/app.js';

export default async (req, res) => {
  return app(req, res);
};
