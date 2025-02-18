import { Request } from 'express';
import { blacklistedAutomatedIps, whitelistedUserAgents } from '../constants/whitelists';
import ss from 'simple-statistics';

const lastQueryTime: Record<string, number> = {};
const lastQueryTimes: Record<string, number[]> = {};
const numLookupsPerIP: Record<string, number> = {};

export function isAutomated(req: Request): boolean {
    const connectingIp = (req.headers['cf-connecting-ip'] as string) || req.connection.remoteAddress || '';
    if (blacklistedAutomatedIps.includes(connectingIp)) {
        console.log(`BLACKLISTED IP ${connectingIp}`);
        return true;
    }

    const userAgent = req.headers['user-agent'] || '';
    if (whitelistedUserAgents.some((whitelistedAgent) => userAgent.includes(whitelistedAgent))) {
        return false;
    }
    return false;
}

export async function checkIPAutomatedSTDDEV(req: Request): Promise<boolean> {
    const ip = (req.headers['cf-connecting-ip'] as string) || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    if (whitelistedUserAgents.some((whitelistedAgent) => userAgent.includes(whitelistedAgent))) {
        return false;
    }

    if (!ip) {
        console.log('No IP found.');
        return true;
    }

    if (numLookupsPerIP[ip] === undefined) {
        numLookupsPerIP[ip] = 0;
    }

    if (lastQueryTime[ip] === undefined) {
        lastQueryTime[ip] = Date.now();
        return false;
    } else {
        const timeSinceLastQuery = (Date.now() - lastQueryTime[ip]);
        console.log(`Time since last query for ${ip}: ${timeSinceLastQuery}`);

        numLookupsPerIP[ip] += 1;
        console.log(ip + ' has ' + numLookupsPerIP[ip] + ' lookups.');

        if (numLookupsPerIP[ip] > 200) {
            blacklistedAutomatedIps.push(ip);
            return true;
        }

        if (lastQueryTimes[ip] === undefined) {
            lastQueryTimes[ip] = [];
        }

        if (lastQueryTimes[ip].length < 40) {
            lastQueryTimes[ip].push(timeSinceLastQuery);
        } else if (lastQueryTimes[ip].length >= 40) {
            lastQueryTimes[ip].shift();
            lastQueryTimes[ip].push(timeSinceLastQuery);
        }

        if (lastQueryTimes[ip].length >= 20) {
            const standardDeviation = ss.standardDeviation(lastQueryTimes[ip]);
            console.log(`Standard deviation for ${ip}: ${standardDeviation}`);
            if (standardDeviation < 1800) {
                console.log('Automated scraping detected.');
                blacklistedAutomatedIps.push(ip);
                return true;
            }
        }

        if (lastQueryTimes[ip].length >= 20) {
            if (lastQueryTimes[ip].every((request) => request < 5000)) {
                blacklistedAutomatedIps.push(ip);
                return true;
            }
        }

        lastQueryTime[ip] = Date.now();
        return false;
    }
}

export function doAutomatedRes(res: any, json?: boolean) {
    const { v4: uuidv4 } = require('uuid');

    if (json) {
        return res.json({
            resultCount: 69420,
            count: 69420,
            records: [
                {
                    id: uuidv4(),
                    firstName: '[[EXTREMELY LOUD INCORRECT BUZZER]]',
                    lastName: 'Automated scraping detected. Please contact miyakoyakota@riseup.com to be whitelisted.',
                    email: 'This data comes from https://search.illicit.services and it is free to use. Do not pay for access.'
                }
            ]
        });
    } else {
        const mustache = require('mustache');
        const fs = require('fs');
        const recordsListingTemplate = fs.readFileSync(__dirname + '/../templates/recordsListing.mustache', 'utf-8');

        const rendered = mustache.render(recordsListingTemplate, {
            resultCount: 69420,
            count: 69420,
            records: [
                {
                    id: uuidv4(),
                    firstName: '[[EXTREMELY LOUD INCORRECT BUZZER]]',
                    fields: [
                        "firstName: [[EXTREMELY LOUD INCORRECT BUZZER]]",
                        "lastName: Automated scraping detected. Please contact miyakoyakota@riseup.com to be whitelisted. If you would like to use this site as an API, you may add ?wt=json",
                        "email: This data comes from https://search.illicit.services and it is free to use. Do not pay for access."
                    ]
                }
            ]
        });

        return res.send(rendered);
    }
}
