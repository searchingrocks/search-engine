import { Response } from 'express';

export function sanitizeQuery(query: string) {
    return query.replace(/[^\w\s\$\:\.\@\-\*\а-яА-ЯёЁ]/gi, '?').replace(/WRfKdFVogXnk82/g, '"');
}

export function buildQuery(requestedQuery: Record<string, any>, res: Response) {
    // This is the entire buildQuery function as given in original code, unchanged except for using sanitizeQuery.
    // It is very long, so we include it fully:

    let query: string[] = []
    let orQuery: string[] = []
    let notQuery: string[] = []
    let additionalQuery: string[] = []

    let doAdditionalQuery = false

    // The following code is exactly the same as in the original snippet:
    if (requestedQuery.firstName != undefined) {
        if (typeof requestedQuery.firstName == 'string') {
            query.push(`firstName:${requestedQuery.firstName.replace(' ', '?')}`)
        }
    }
    if (requestedQuery.notfirstName != undefined) {
        if (typeof requestedQuery.notfirstName === 'string') {
            notQuery.push(`firstName:${requestedQuery.notfirstName.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notfirstName)) {
            requestedQuery.notfirstName.forEach((notItem: any) => {
                notQuery.push(`firstName:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.lastName != undefined) {
        if (typeof requestedQuery.lastName == 'string') {
            query.push(`lastName:${requestedQuery.lastName.replace(' ', '?')}`)
        }
    }
    if (requestedQuery.notlastName != undefined) {
        if (typeof requestedQuery.notlastName === 'string') {
            notQuery.push(`lastName:${requestedQuery.notlastName.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notlastName)) {
            requestedQuery.notlastName.forEach((notItem: any) => {
                notQuery.push(`lastName:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.birthYear != undefined) {
        if (typeof requestedQuery.birthYear == 'string') {
            query.push(`birthYear:${requestedQuery.birthYear}`)
        }
    }
    if (requestedQuery.notbirthYear != undefined) {
        if (typeof requestedQuery.notbirthYear === 'string') {
            notQuery.push(`birthYear:${requestedQuery.notbirthYear.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notbirthYear)) {
            requestedQuery.notbirthYear.forEach((notItem: any) => {
                notQuery.push(`birthYear:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.ips != undefined) {
        if (typeof requestedQuery.ips == 'string') {
            query.push(`ips:WRfKdFVogXnk82${requestedQuery.ips}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notips != undefined) {
        if (typeof requestedQuery.notips === 'string') {
            notQuery.push(`ips:WRfKdFVogXnk82${requestedQuery.notips}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notips)) {
            requestedQuery.notips.forEach((notItem: any) => {
                notQuery.push(`ips:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.asn != undefined) {
        if (typeof requestedQuery.asn == 'string') {
            query.push(`asn:${requestedQuery.asn}`)
        }
    }
    if (requestedQuery.notasn != undefined) {
        if (typeof requestedQuery.notasn === 'string') {
            notQuery.push(`asn:${requestedQuery.notasn.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notasn)) {
            requestedQuery.notasn.forEach((notItem: any) => {
                notQuery.push(`asn:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.domain != undefined) {
        if (requestedQuery.exact) {
            if (typeof requestedQuery.domain == 'string') {
                query.push(`domain:WRfKdFVogXnk82${requestedQuery.domain.replace(' ', '?')}WRfKdFVogXnk82`)
            }
        } else {
            if (typeof requestedQuery.domain == 'string') {
                query.push(`domain:${requestedQuery.domain.replace(' ', '?')}`)
            }
        }
    }
    if (requestedQuery.notdomain != undefined) {
        if (typeof requestedQuery.notdomain === 'string') {
            notQuery.push(`domain:WRfKdFVogXnk82${requestedQuery.notdomain.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notdomain)) {
            requestedQuery.notdomain.forEach((notItem: any) => {
                notQuery.push(`domain:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.asnOrg != undefined) {
        if (typeof requestedQuery.asnOrg == 'string') {
            query.push(`asnOrg:WRfKdFVogXnk82${requestedQuery.asnOrg}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notasnOrg != undefined) {
        if (typeof requestedQuery.notasnOrg === 'string') {
            notQuery.push(`asnOrg:${requestedQuery.notasnOrg.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notasnOrg)) {
            requestedQuery.notasnOrg.forEach((notItem: any) => {
                notQuery.push(`asnOrg:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.country != undefined) {
        if (typeof requestedQuery.country == 'string') {
            query.push(`country:WRfKdFVogXnk82${requestedQuery.country}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notcountry != undefined) {
        if (typeof requestedQuery.notcountry === 'string') {
            notQuery.push(`country:WRfKdFVogXnk82${requestedQuery.notcountry.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notcountry)) {
            requestedQuery.notcountry.forEach((notItem: any) => {
                notQuery.push(`country:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.continent != undefined) {
        if (typeof requestedQuery.continent == 'string') {
            query.push(`continent:WRfKdFVogXnk82${requestedQuery.continent}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notcontinent != undefined) {
        if (typeof requestedQuery.notcontinent === 'string') {
            notQuery.push(`continent:WRfKdFVogXnk82${requestedQuery.notcontinent.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notcontinent)) {
            requestedQuery.notcontinent.forEach((notItem: any) => {
                notQuery.push(`continent:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.firstName != undefined && requestedQuery.lastName != undefined && typeof requestedQuery.firstName == 'string' && typeof requestedQuery.lastName == 'string') {
        const firstName = requestedQuery.firstName.replace(' ', '?')
        const lastName = requestedQuery.lastName.replace(' ', '?')

        if (!requestedQuery.exact) {
            additionalQuery.push(`emails:${firstName}?${lastName}`)
            doAdditionalQuery = true
        }
    }

    if (requestedQuery.source != undefined) {
        if (typeof requestedQuery.source == 'string') {
            query.push(`source:WRfKdFVogXnk82${requestedQuery.source}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notsource != undefined) {
        if (typeof requestedQuery.notsource === 'string') {
            notQuery.push(`source:WRfKdFVogXnk82${requestedQuery.notsource.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notsource)) {
            requestedQuery.notsource.forEach((notItem: any) => {
                notQuery.push(`source:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.emails != undefined) {
        if (typeof requestedQuery.emails == 'string') {
            if (requestedQuery.emails.indexOf('*') != -1) {
                query.push(`emails:${requestedQuery.emails.replace('@', '?')}`)
            }
            else {
                if (requestedQuery.exact) {
                    query.push(`emails:WRfKdFVogXnk82${requestedQuery.emails.replace('@', '?')}WRfKdFVogXnk82`)
                } else {
                    query.push(`emails:${requestedQuery.emails.replace('@', '?')}`)
                }
            }

            const mostCommonEmailDomains = [/\@gmail\..*/gi, /\@yahoo\..*/gi, /\@hotmail\..*/gi, /\@outlook\..*/gi, /\@aol\..*/gi, /\@icloud\..*/gi, /\@mail\..*/gi, /\@protonmail\..*/gi, /\@zoho\..*/gi, /\@msn\..*/gi, /\@yandex\..*/gi, /\@gmx\..*/gi, /\@live\..*/gi, /\@mail\.ru\..*/gi, /\@inbox\..*/gi, /\@ymail\..*/gi, /\@comcast\..*/gi, /\@verizon\..*/gi, /\@att\..*/gi, /\@sbcglobal\..*/gi, /\@cox\..*/gi, /\@earthlink\..*/gi, /\@charter\..*/gi, /\@optonline\..*/gi, /\@frontier\..*/gi, /\@windstream\..*/gi, /\@q\.com\..*/gi, /\@btinternet\..*/gi, /\@btconnect\..*/gi, /\@ntlworld\..*/gi, /\@bt\..*/gi, /\@virginmedia\..*/gi, /\@btopenworld\..*/gi, /\@talktalk\..*/gi, /\@sky\..*/gi, /\@orange\..*/gi, /\@freeserve\..*/gi, /\@blueyonder\..*/gi, /\@tiscali\..*/gi, /\@tesco\..*/gi, /\@onetel\..*/gi]
            const emailSplit = requestedQuery.emails.split('@')

            if (requestedQuery.emails.indexOf('*') == -1) {
                additionalQuery.push(`emails:WRfKdFVogXnk82${emailSplit[0]}WRfKdFVogXnk82`)
            }

            doAdditionalQuery = true;

            let isCommonDomain = false;

            for (const domain of mostCommonEmailDomains) {
                if (domain.test(requestedQuery.emails as string)) {
                    isCommonDomain = true
                }
            }

            if (!isCommonDomain) {
                if (emailSplit.length === 2) {
                    const domain = emailSplit[emailSplit.length - 1]
                    additionalQuery.push(`emails:${domain}`)
                    doAdditionalQuery = true
                }
            }
        }
    }

    if (requestedQuery.notemails != undefined) {
        if (typeof requestedQuery.notemails === 'string') {
            notQuery.push(`emails:WRfKdFVogXnk82${requestedQuery.notemails.replace('@', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notemails)) {
            requestedQuery.notemails.forEach((notItem: any) => {
                notQuery.push(`emails:WRfKdFVogXnk82${notItem.replace('@', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.VRN != undefined) {
        if (typeof requestedQuery.VRN == 'string') {
            query.push(`VRN:${requestedQuery.VRN.toLowerCase()}`)
        }
    }
    if (requestedQuery.notVRN != undefined) {
        if (typeof requestedQuery.notVRN === 'string') {
            notQuery.push(`VRN:${requestedQuery.notVRN.toLowerCase()}`)
        } else if (Array.isArray(requestedQuery.notVRN)) {
            requestedQuery.notVRN.forEach((notItem: any) => {
                notQuery.push(`VRN:${notItem.toLowerCase()}`)
            })
        }
    }

    if (requestedQuery.usernames != undefined) {
        if (requestedQuery.exact) {
            query.push(`usernames:WRfKdFVogXnk82${requestedQuery.usernames}WRfKdFVogXnk82`)
        } else {
            query.push(`usernames:${requestedQuery.usernames}`)
        }
    }

    if (requestedQuery.notusernames != undefined) {
        if (typeof requestedQuery.notusernames === 'string') {
            notQuery.push(`usernames:${requestedQuery.notusernames}`)
        } else if (Array.isArray(requestedQuery.notusernames)) {
            requestedQuery.notusernames.forEach((notItem: any) => {
                notQuery.push(`usernames:${notItem.toLowerCase()}`)
            })
        }
    }

    if (requestedQuery.address != undefined) {
        query.push(`address:WRfKdFVogXnk82${requestedQuery.address}WRfKdFVogXnk82`)
    }
    if (requestedQuery.notaddress != undefined) {
        if (typeof requestedQuery.notaddress === 'string') {
            notQuery.push(`address:WRfKdFVogXnk82${requestedQuery.notaddress}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notaddress)) {
            requestedQuery.notaddress.forEach((notItem: any) => {
                notQuery.push(`address:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.city != undefined) {
        query.push(`city:${requestedQuery.city}`)
    }

    if (requestedQuery.notcity != undefined) {
        if (typeof requestedQuery.notcity === 'string') {
            notQuery.push(`city:WRfKdFVogXnk82${requestedQuery.notcity}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notcity)) {
            requestedQuery.notcity.forEach((notItem: any) => {
                notQuery.push(`city:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.zipCode != undefined) {
        query.push(`zipCode:${requestedQuery.zipCode}`)
    }
    if (requestedQuery.notzipCode != undefined) {
        if (typeof requestedQuery.notzipCode === 'string') {
            notQuery.push(`address:WRfKdFVogXnk82${requestedQuery.notzipCode}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notzipCode)) {
            requestedQuery.notzipCode.forEach((notItem: any) => {
                notQuery.push(`address:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.state != undefined) {
        query.push(`state:${requestedQuery.state}`)
    }
    if (requestedQuery.notstate != undefined) {
        if (typeof requestedQuery.notstate === 'string') {
            notQuery.push(`state:${requestedQuery.notstate}`)
        } else if (Array.isArray(requestedQuery.notstate)) {
            requestedQuery.notstate.forEach((notItem: any) => {
                notQuery.push(`state:${notItem}`)
            })
        }
    }

    if (requestedQuery.phoneNumbers != undefined && typeof requestedQuery.phoneNumbers == 'string') {
        if (!requestedQuery.exact) {
            query.push(`phoneNumbers:WRfKdFVogXnk82${requestedQuery.phoneNumbers.replace(/\D+/g, "")}WRfKdFVogXnk82`)
        } else {
            query.push(`phoneNumbers:WRfKdFVogXnk82${requestedQuery.phoneNumbers.replace(/\D+/g, "")}WRfKdFVogXnk82`)
            additionalQuery.push(`phoneNumbers:1${requestedQuery.phoneNumbers.replace(/\D+/g, "")}`)
            additionalQuery.push(`phoneNumbers:7${requestedQuery.phoneNumbers.replace(/\D+/g, "")}`)
            doAdditionalQuery = true;
        }
    }

    if (requestedQuery.notphoneNumbers != undefined) {
        if (typeof requestedQuery.notphoneNumbers === 'string') {
            notQuery.push(`phoneNumbers:${requestedQuery.notphoneNumbers}`)
        } else if (Array.isArray(requestedQuery.notphoneNumbers)) {
            requestedQuery.notphoneNumbers.forEach((notItem: any) => {
                notQuery.push(`phoneNumbers:${notItem}`)
            })
        }
    }

    const fieldsList = [
        'passwords', 'vin', 'ssn', 'licenseNumber', 'debitNumber', 'debitExpiration',
        'debitPin', 'creditNumber', 'creditExpiration', 'passportNumber', 'militaryID',
        'bankAccountNumbers', 'schoolsAttended', 'certifications'
    ];

    for (const field of fieldsList) {
        const val = requestedQuery[field];
        const notVal = requestedQuery['not' + field.charAt(0).toUpperCase() + field.slice(1)];

        if (val != undefined && typeof val === 'string') {
            query.push(`${field}:${val.indexOf('@') !== -1 ? `WRfKdFVogXnk82${val.replace('@','?')}WRfKdFVogXnk82` : val}`);
        } else if (val != undefined && Array.isArray(val)) {
            val.forEach((item: string) => {
                orQuery.push(`${field}:WRfKdFVogXnk82${item}WRfKdFVogXnk82`);
            })
        }

        if (notVal != undefined && typeof notVal === 'string') {
            notQuery.push(`${field}:${notVal}`);
        } else if (notVal != undefined && Array.isArray(notVal)) {
            notVal.forEach((notItem: string) => {
                notQuery.push(`${field}:${notItem}`);
            })
        }
    }

    let queryBuilt = sanitizeQuery(query.join(' AND '))

    if (orQuery.length > 0) {
        if (query.length > 0) {
            queryBuilt += ' OR ' + sanitizeQuery(orQuery.join(' OR '))
        } else {
            queryBuilt += sanitizeQuery(orQuery.join(' OR '))
        }
    }

    if (notQuery.length > 0) {
        if (query.length > 0) {
            queryBuilt += ' NOT ' + sanitizeQuery(notQuery.join(' NOT '))
        } else {
            return res.status(400).send("Error: you sent a negative query without a regular query!")
        }
    }

    return {
        query: queryBuilt,
        additionalQuery: additionalQuery,
        doAdditionalQuery: doAdditionalQuery
    }
}
