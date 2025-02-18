# Search

This project is built on the foundation of **search.0t.rocks**. I’ve open-sourced my version and made significant improvements, including a complete cleanup of the original codebase. The initial implementation was highly disorganized—possibly by design—but I’ve restructured and optimized it for better clarity and maintainability. My goal is to keep this version continuously updated, enhanced, and user-friendly.


## Data Handling

### Add Data
Download the Solr binary
And make sure the json file is in **jsonl** format but the extension is json.
```bash
bin/post -c BigData sample.json
```

### Record Types

<details>
<summary>List of record types</summary>

- accuracy_radius
- address
- asn
- asnOrg
- autoBody
- autoClass
- autoMake
- autoModel
- autoYear
- bankAccountNumbers
- birthMonth
- birthYear
- birthday
- certifications
- city
- continent
- country
- creditExpiration
- creditNumber
- creditPin
- debitExpiration
- debitNumber
- debitPin
- dob
- domain
- emails
- ethnicity
- firstName
- gender
- income
- ips
- lastName
- latLong
- licenseNumber
- line
- links
- location
- middleName
- militaryID
- notes
- party
- passportNumber
- passwords
- phoneNumbers
- photos
- politicalAffiliation
- schoolsAttended
- source
- ssn
- state
- usernames
- vin
- VRN
- zipCode
</details>
<details>
<summary>Record Format Examples</summary>
### Example Record Formats
```json
{"id": "d385f27a-1b9e-474b-a82c-764b9d3f1c5e", "emails": ["john.doe@example.com", "johndoe123@email.net"], "firstName": "John", "lastName": "Doe", "gender": "m", "dob": "1985-03-15", "phoneNumbers": ["555-123-4567", "+1-555-234-5678"], "address": "123 Main St", "city": "Anytown", "state": "CA", "zipCode": "90210", "country": "USA", "latLong": "34.0522,-118.2437", "continent": "North America"}
{"id": "7a2f4b8c-9d1e-4827-b5a6-3c2f1d9e8b7a", "usernames": ["jane_doe", "jdoe88"], "gender": "f", "birthYear": "1988", "birthMonth": "11", "birthday": "22", "ethnicity": "caucasian", "ssn": "987-65-4321", "passportNumber": "AB1234567", "schoolsAttended": ["University of California, Berkeley", "Anytown High School"], "certifications": ["Certified Public Accountant", "Project Management Professional"], "politicalAffiliation": "Independent"}
{"id": "e87b9c2d-1f6a-4539-b2c1-8d7e6f4a5b3c", "autoMake": "Toyota", "autoModel": "Camry", "autoYear": "2020", "autoBody": "4dr Sedan", "autoClass": "Midsize Car", "vin": "JTD1234567890123", "VRN": "ABC-123", "state": "NY"}
{"id": "5c4d3e2f-1a9b-4837-b6c5-9d8e7f6a4b2c", "ips": ["192.168.1.1", "10.0.0.1", "2001:db8::1"], "domain": "example.net", "links": ["https://www.linkedin.com/in/example", "https://twitter.com/example", "https://facebook.com/example"], "asn": "12345", "asnOrg": "Example Org"}
{"id": "b9a8c7d6-5e4f-3210-a8b7-6c5d4e3f2a1b", "firstName": "Alice", "middleName": "Smith", "lastName": "Johnson", "gender": "f", "income": "60000", "creditNumber": "1234-5678-9012-3456", "creditExpiration": "12/25", "creditPin": "1234"}
{"id": "2f8a7b6c-5d4e-3109-a7b6-4c3d2e1f9a8b", "passwords": ["password123", "qwertyuiop", "MyS3cr3tP@$$wOrd"], "emails": ["test@example.org", "anothertest@email.com"], "phoneNumbers": ["555-987-6543", "212-555-1234"], "source": "dark web forum", "usernames": ["testuser1", "codingmaster"]}
{"id": "f4a2b8c9-7e6d-5312-b8c7-9d6e5f4a3b2c", "firstName": "Robert", "lastName": "Williams", "licenseNumber": "DL123456789", "state": "TX", "militaryID": "MIL987654321", "politicalAffiliation": "democrat"}
{"id": "6c5b4a3d-2e1f-9870-a7b6-8d4e3f2a1c9b", "bankAccountNumbers": ["1234567890", "0987654321"], "debitNumber": "9876-5432-1098-7654", "debitExpiration": "06/24", "debitPin": "9876", "notes": ["Prefers direct deposit.", "Joint account with spouse."]}
{"id": "1d9a8b7c-6e5f-4321-a8b7-5c4d3e2f1a9b", "photos": ["http://example.com/photo1.jpg", "http://example.com/photo2.png", "https://s3.amazonaws.com/bucket/photo3.jpeg"], "address": "456 Oak Ave", "city": "Springfield", "zipCode": "65432", "latLong": "40.7128,-74.0060", "location": "Near the park", "accuracy_radius": "50"}
{"id": "83jk029d-3a2b-4c5f-b8e7-9d6e5f4a3b2c", "line": "1", "party": ["Group A", "Association B"], "notes": ["This is a note.", "Another note here."]}
```
</details>