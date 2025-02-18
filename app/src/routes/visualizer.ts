import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import mustache from 'mustache';

const visualizerTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'visualizer.html'),
  'utf-8'
);

const visualizerRouter = Router();

visualizerRouter.get('/', async (req, res) => {
  const rendered = mustache.render(visualizerTemplate, {});
  res.send(rendered);
});

export default visualizerRouter;
