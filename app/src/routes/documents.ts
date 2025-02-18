import { Router } from 'express';
import { isAutomated, checkIPAutomatedSTDDEV, doAutomatedRes } from '../utilities/security';
import { queryForDocs } from '../utilities/solrQueries';
import fs from 'fs';
import mustache from 'mustache';
import _ from 'lodash';
import { getSimilarRecords } from '../utilities/similarRecords';

const recordByIdTemplate = fs.readFileSync(__dirname + '/../templates/recordById.mustache', 'utf-8');

const documentsRouter = Router();

documentsRouter.get('/by_id/:id', async (req, res) => {
    if (isAutomated(req)) {
        return doAutomatedRes(res, req.query.wt === 'json');
    }

    if (await checkIPAutomatedSTDDEV(req)) {
        return doAutomatedRes(res, req.query.wt === 'json');
    }

    const records = await queryForDocs(`id:${req.params.id}`);
    const record = records.records[0];

    if (record === undefined) {
        return res.status(404).send('No record found.');
    }

    if (req.query.wt == 'json') {
        if (req.query.moreLikeThis == 'true') {
            const similarRecords = await getSimilarRecords(record).catch((err) => {
                console.log(err)
                return []
            });
            return res.json({
                record: record,
                related: similarRecords
            });
        } else {
            return res.json({
                record: record
            });
        }
    }

    const similarRecords = await getSimilarRecords(record).catch((err) => {
        return []
    });

    const rendered = mustache.render(recordByIdTemplate, {
        id: record.id,
        record: Object.entries(_.omit(record, ['id', '_version_'])).map(([key, value]) => {
            return {
                key: key,
                value: value
            }
        }),
        related: similarRecords.map((rec) => {
            return {
                id: rec.id,
                record: Object.entries(_.omit(rec, ['id', '_version_'])).map(([key, value]) => {
                    return {
                        key: key,
                        value: value
                    }
                })
            }
        })
    });

    return res.send(rendered);
});

export default documentsRouter;
