import axios from 'axios';
import { SolrRecord } from '../types/solrrecord';

const servers = ["http://solr1:8983/solr/BigData/select"];

function getRandServer() {
    var index = Math.floor(Math.random() * servers.length);
    return servers[index];
}

export async function queryForDocsSpatial(latLong: string, distanceKm: number) {
    const records: SolrRecord[] = [];
    let numDocs = 0;

    await axios.get(getRandServer(), {
        params: {
            q: "latLong:*",
            rows: 500,
            fq: "{!geofilt sfield=latLong}",
            pt: latLong,
            d: distanceKm
        }
    }).then(({ data }) => {
        records.push(...data.response.docs);
        numDocs += data.response.numFound;
    });

    console.log(`Spatial query for ${latLong} returned ${numDocs} records.`);

    return {
        numDocs: numDocs,
        records: records
    };
}

export async function queryForDocs(query: string, limit?: number, start?: number, sort?: string) {
    const records: SolrRecord[] = [];
    let numDocs = 0;

    await axios.get(getRandServer(), {
        params: {
            q: query,
            rows: limit || 100,
            sort: sort,
            start: start || 0
        }
    }).then(({ data }) => {
        records.push(...data.response.docs);
        numDocs += data.response.numFound;
    });

    return {
        numDocs: numDocs,
        records: records
    };
}

export async function queryForExportDocs(query: string, limit?: number, start?: number, sort?: string) {
    const records: SolrRecord[] = [];
    let numDocs = 0;

    await axios.get(getRandServer().replace('BigData', 'Exports'), {
        params: {
            q: query,
            rows: limit || 100,
            sort: sort,
            start: start || 0
        }
    }).then(({ data }) => {
        records.push(...data.response.docs);
        numDocs += data.response.numFound;
    });

    return {
        numDocs: numDocs,
        records: records
    };
}

export { getRandServer };
