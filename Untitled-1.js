// mainScript.js

import { check } from 'k6';
import http from 'k6/http';
import papaparse from 'papaparse';

export const options = {
    vus: 2,
    duration: '1s',
};

// Read the CSV file using papaparse
const csvData = open('./combined.csv');
const parsedData = papaparse.parse(csvData);
const data = parsedData.data.slice(1); // Skip header line

// Extract token value from the CSV
const token = data[0][2]; // Assuming token is in the first row and the third column (zero-indexed)

export default function () {
    const url = 'https://lt-1-stage-api.penpencil.co/v1/conversation/65e4d37af8dc041a31e55007/chat?limit=50';

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://admin-v2-stage.penpencil.co/',
            'Client-Type': 'ADMIN',
            'Authorization': `Bearer ${token}`, // Use the token variable here
        },
    };

    const res = http.get(url, params);
    check(res, { 'status is 200': (r) => r.status === 200 });
}
