import { Router } from 'express';
import { queryForDocsSpatial } from '../utilities/solrQueries';

const spatialRouter = Router();

spatialRouter.get('/', async (req, res) => {
    if (req.query.latLong != undefined && typeof req.query.latLong === 'string') {
        const latLongRegex = /^-?\d{1,3}(?:\.\d{1,20})?,-?\d{1,3}(?:\.\d{1,20})?$/;
        const d = parseFloat((req.query.d as string) || '0.2')
        if (d < 0.1 || d > 1000) {
            return res.send({
                error: true,
                errorMessage: 'Please provide a valid d between 0.1 and 1000'
            })
        }

        if (latLongRegex.test(req.query.latLong)) {
            let recordsResponse = await queryForDocsSpatial(req.query.latLong, d).catch((err) => {
                return {
                    numDocs: 0,
                    records: []
                }
            })

            res.json(recordsResponse)
        } else {
            return res.send({
                error: true,
                errorMessage: 'Please only send coordinates as lat,long'
            })
        }
    } else {
        res.json({
            error: true,
            errorMessage: "Provide a latLong!"
        })
    }
});

export default spatialRouter;
