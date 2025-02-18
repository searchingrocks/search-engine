import { Router } from 'express';
import { requireLogin } from '../middlewares/auth';
import { isAutomated, checkIPAutomatedSTDDEV, doAutomatedRes } from '../utilities/security';
import { queryForDocs } from '../utilities/solrQueries';
import { buildQuery, sanitizeQuery } from '../utilities/queryBuilder';
import fs from 'fs';
import mustache from 'mustache';
import _ from 'lodash';

const recordsListingTemplate = fs.readFileSync(__dirname + '/../templates/recordsListing.mustache', 'utf-8');
const whitelistedUserAgents: string[] = [];

interface QueryBuilt {
  query: string;
  additionalQuery: string[];
  doAdditionalQuery: boolean;
}

const recordsRouter = Router();

recordsRouter.get('/', requireLogin, async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'] || '';

        if (userAgent !== 'yeayeyayaeyayeayeyaeyeayyaeyeyaeyae') {
            if (isAutomated(req)) {
                return doAutomatedRes(res, req.query.wt === 'json')
            }
        }

        if (req.query.wt === 'json') {
            const apiKey = req.query.apikey || req.headers['user-agent'];
            if (typeof apiKey === 'string') {
                if (!whitelistedUserAgents.includes(apiKey)) {
                    res.status(403);
                    return res.json({
                        error: true,
                        message: 'API Access requires a free API token. Contact miyakoyakota@riseup.com.'
                    })
                }
            } else {
                return res.json({ error: true, message: 'API Access requires a free API token.' })
            }
        }

        let requestedQuery: Record<string, any> = {};
        for (const [key, value] of Object.entries(req.query)) {
            if (key !== 'wt') {
                if (typeof value === 'string' || Array.isArray(value)) {
                    requestedQuery[key] = value
                }
            }
        }

        // Assert the type here to avoid TS union errors:
        const queryBuilt = buildQuery(requestedQuery, res) as QueryBuilt | null;

        if (!queryBuilt || !queryBuilt.query) {
            return; // possibly already responded or invalid query
        }

        let totalRecordCount = 0;
        let recordsResponse: any = await queryForDocs(queryBuilt.query).catch((err) => {
            console.log(err)
            return { numDocs: 0, records: [] }
        });

        totalRecordCount += recordsResponse.numDocs;
        let records = recordsResponse.records;

        if (queryBuilt.doAdditionalQuery && !req.query.exact) {
            const additionalQueryBuilt = sanitizeQuery(queryBuilt.additionalQuery.join(' OR '));
            let additionalRecordsResponse: any = null;

            if (typeof req.query.sofreshandsoclean === 'string') {
                additionalRecordsResponse = await queryForDocs(additionalQueryBuilt, 10000).catch((err) => {
                    return { numDocs: 0, records: [] }
                })
            } else {
                additionalRecordsResponse = await queryForDocs(additionalQueryBuilt).catch((err) => {
                    return { numDocs: 0, records: [] }
                })
            }

            totalRecordCount += additionalRecordsResponse.numDocs;
            const additionalRecords = additionalRecordsResponse.records;
            records.push(...additionalRecords);
        }

        let recordsFinal = records.map((record: any) => {
            return {
                ...record,
                canMap: Boolean(record.address) || Boolean(record.latLong),
                fields: Object.keys(_.omit(record, ['id', '_version_'])).map((key) => {
                    return `${key}: ${record[key]}`
                })
            }
        })

        recordsFinal = _.uniqBy(recordsFinal, 'id');

        if (req.query.wt == 'json') {
            return res.json({
                resultCount: totalRecordCount,
                count: records.length,
                records: recordsFinal
            })
        } else {
            const rendered = mustache.render(recordsListingTemplate, {
                resultCount: totalRecordCount,
                count: records.length,
                records: recordsFinal,
                finalquery: queryBuilt.query
            })

            return res.send(rendered)
        }
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
});

export default recordsRouter;
