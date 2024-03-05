import { check } from 'k6';
import http from 'k6/http';
import { open } from 'k6';

export const options = {
    executor: 'shared-iterations',
    vus: 10,
    duration: '1s',
};

// Read the CSV file
const csvData = open('./data.csv');
const data = csvData.split('\n').filter(line => line.trim() !== '').slice(1);

export default function () {
    // Log debug information
    console.log(`VU ${__VU}: Token Index - ${(__VU - 1) % data.length}`);

    // Check if data array is empty
    if (data.length === 0) {
        console.error("CSV data is empty");
        return;
    }

    // Determine the token index based on the VU number
    const tokenIndex = (__VU - 1) % data.length;

    // Check if tokenIndex is valid
    if (tokenIndex < 0 || tokenIndex >= data.length) {
        console.error(`Invalid tokenIndex: ${tokenIndex}`);
        return;
    }

    // Extract token value from the CSV
    const token = data[tokenIndex].split(',')[2]; // Assuming token is in the third column (zero-indexed)

    // Log the extracted token
    console.log(`VU ${__VU}: Token - ${token}`);

    const url = 'https://lt-1-stage-api.penpencil.co/v1/conversation/65e4d37af8dc041a31e55007/chat';
    const payload = JSON.stringify({
        text: "hello diuhuhe",
        type: "text"
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://admin-v2-stage.penpencil.co/',
            'Client-Type': 'ADMIN',
            'Authorization': `Bearer ${token}`, // Use the dynamically calculated token here
        },
    };

    const res = http.post(url, payload, params);
    check(res, {
        'status is 200': (r) => r.status === 200
    });
}
