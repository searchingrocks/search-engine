import axios from 'axios';
import { SolrRecord } from '../types/solrrecord';
import { queryForDocs } from './solrQueries';

export async function getSimilarRecords(record: SolrRecord) {
    let responses: any[] = [];
    const scoresList: Record<string, number> = {};
    const relatedDocIDs: string[] = [];

    const getRandServer = () => "http://solr1:8983/solr/BigData/select";

    await Promise.all([
        ...(record.emails || []).map((email) => {
            return axios.get(getRandServer(), {
                params: {
                    q: `emails:"${email.replace(/\"/gi, '').replace(/\//gi, '')}"`,
                    rows: 20,
                    fl: 'id'
                }
            }).then(({ data }) => {
                data.response.docs.forEach((doc: SolrRecord) => {
                    if (doc.id === record.id) {
                        return
                    }
                    if (!(doc.id in scoresList)) {
                        scoresList[doc.id] = 15
                    } else {
                        scoresList[doc.id] += 5
                    }
                    relatedDocIDs.push(doc.id)
                })
            })
        }),
        ...(record.usernames || []).map((username) => {
            return axios.get(getRandServer(), {
                params: {
                    q: `usernames:"${username.replace(/\"/gi, '').replace(/\//gi, '')}"`,
                    rows: 20,
                    fl: 'id'
                }
            }).then(({ data }) => {
                data.response.docs.forEach((doc: SolrRecord) => {
                    if (doc.id === record.id) {
                        return
                    }
                    if (!(doc.id in scoresList)) {
                        scoresList[doc.id] = 15
                    } else {
                        scoresList[doc.id] += 5
                    }
                    relatedDocIDs.push(doc.id)
                })
            })
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'emails',
                'mlt.mindf': 2,
                'mlt.mintf': 2,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score
                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'usernames',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score
                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'phoneNumbers',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score
                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'address_search',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score
                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'firstName,lastName',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score
                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
    ]);

    let docs: SolrRecord[] = [];

    const uniqueDocIDs = [...new Set(relatedDocIDs)];

    await Promise.all(uniqueDocIDs.map((doc: any) => queryForDocs(`id:${doc}`))).then((results) => {
        results.forEach((result) => {
            docs.push(...result.records.map((r) => {
                return {
                    ...r,
                    'similarity score': scoresList[r.id] || 0,
                }
            }))
        })
    })

    docs = docs.sort((a, b) => {
        if (scoresList[a.id] > scoresList[b.id]) {
            return -1
        } else if (scoresList[a.id] < scoresList[b.id]) {
            return 1
        } else {
            return 0
        }
    })

    return docs
}
