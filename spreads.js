const { google } = require('googleapis');
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

// Konfigurasi Google Sheets API
const credentials = require('./credentials.json');
const spreadsheetId = 'SPREADSHEET_ID'; // Ganti dengan ID spreadsheet Google Anda

// Konfigurasi GitHub API
const octokit = new Octokit({
  auth: 'GITHUB_ACCESS_TOKEN' // Ganti dengan token akses GitHub Anda
});

async function main() {
  try {
    // Inisialisasi Google Sheets API
    const client = await google.auth.getClient({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Mengambil data dari spreadsheet Google
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:C5' // Ganti dengan rentang sel yang ingin Anda ambil
    });

    const values = response.data.values;

    // Membentuk data dalam format yang sesuai untuk diunggah ke GitHub
    const data = values.map(row => ({
      name: row[0],
      age: row[1],
      email: row[2]
    }));

    // Mengunggah data ke GitHub
    const content = JSON.stringify(data, null, 2);
    const path = 'data.json'; // Nama file yang akan diunggah ke GitHub
    const branch = 'main'; // Nama branch tujuan di GitHub
    const commitMessage = 'Update data';

    const { data: { sha } } = await octokit.repos.getContents({
      owner: 'GITHUB_USERNAME', // Ganti dengan username GitHub Anda
      repo: 'REPO_NAME', // Ganti dengan nama repositori di GitHub
      path
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: 'GITHUB_USERNAME',
      repo: 'REPO_NAME',
      path,
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch
    });

    console.log('Data berhasil diunggah ke GitHub');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
}

main();
