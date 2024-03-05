import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Using SharedArray to load and parse the CSV file only once
const csvData = new SharedArray('csvData', function () {
  return papaparse.parse(open('./combined.csv'), { header: true }).data;
});

export let options = {
  scenarios: {
    contacts: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '1s',
    },
  },
};

export default function () {
  const userPwdToken = csvData[__VU - 1]; // Each VU gets its corresponding row
  console.log(JSON.stringify(userPwdToken));

  // Ensure the correct header name for the third column in your CSV file
  const tokenFromCSV = userPwdToken['token'];

  const url = 'https://lt-1-stage-api.penpencil.co/v1/conversation/65e4d37af8dc041a31e55007/chat?limit=50';

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://admin-v2-stage.penpencil.co/',
    'Client-Type': 'ADMIN',
    'Authorization': `Bearer ${tokenFromCSV}`, // Use the token from CSV data here
  };

  const res = http.get(url, { headers });
  check(res, { 'status is 200': (r) => r.status === 200 });

  // Print both the response body and headers to the console
  console.log(`VU: ${__VU}, Iteration: ${__ITER}, Response Headers: ${JSON.stringify(res.headers)}, Response Body: ${res.body}`);

  // Add a sleep to simulate user activity
  sleep(1);
}
