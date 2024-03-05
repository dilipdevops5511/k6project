import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Using SharedArray to load and parse the CSV file only once
const csvData = new SharedArray('csvData', function () {
  return papaparse.parse(open('./combined.csv'), { header: true }).data;
});

export default function () {
  // Loop through all username/password/token triples
  for (const userPwdToken of csvData) {
    console.log(JSON.stringify(userPwdToken));

    const params = {
      token: userPwdToken['3rd column'], // Assuming the header is '3rd column' in CSV
    };
    console.log('User with token: ', JSON.stringify(params));

    const url = 'https://lt-1-stage-api.penpencil.co/v1/conversation/65e4d37af8dc041a31e55007/chat?limit=50';

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://admin-v2-stage.penpencil.co/',
      'Client-Type': 'ADMIN',
      'Authorization': `Bearer ${userPwdToken['3rd column']}`, // Use the token from CSV data here
    };

    const res = http.get(url, { headers });
    check(res, { 'status is 200': (r) => r.status === 200 });

    // Add a sleep to simulate user activity
    sleep(1);
  }
}
