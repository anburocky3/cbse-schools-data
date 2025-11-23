# CBSE School List — (Data via API)

[![Stars](https://img.shields.io/github/stars/anburocky3/cbse-schools-data)](https://github.com/anburocky3/cbse-schools-data)
[![Forks](https://img.shields.io/github/forks/anburocky3/cbse-schools-data)](https://github.com/anburocky3/cbse-schools-data)
[![GitHub license](https://img.shields.io/github/license/anburocky3/cbse-schools-data)](https://github.com/anburocky3/cbse-schools-data)
![Anbuselvan Rocky Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fanburocky3%2Fcbse-schools-data)
[![Support Server](https://img.shields.io/discord/742347296091537448.svg?label=Discord&logo=Discord&colorB=7289da)](https://discord.gg/6ktMR65YMy)
[![Cyberdude youtube](https://img.shields.io/youtube/channel/subscribers/UCteUj8bL1ppZcS70UCWrVfw?style=social)](https://www.youtube.com/c/cyberdudenetworks)

This api contains 31000+ cbse school data, like names, district, address, etc., including inauguration_date with current principal details across India. The data is sourced from the CBSE Saras website.

> You can download the entire data-set here

> Note: This project is not affiliated with or endorsed by any government entity. Data comes from publicly available pages and may change or break at any time.

## 🚀 Available Endpoints

- 👉 [GET - List all CBSE Schools](https://cbse-schools.netlify.app/api/schools)
- 👉 [GET - /api/schools/{affiliatedId} - Get Detailed School Info](https://cbse-schools.netlify.app/api/schools/1930706)
- 👉 [GET - /api/states - List available states ](https://cbse-schools.netlify.app/api/states)
- 👉 [GET - /api/states/{state} - Get districts of that state](https://cbse-schools.netlify.app/api/states/19)
- 👉 [GET - GET /api/states/{state}/{district} - List all schools on that district](https://cbse-schools.netlify.app/api/states/19/03)

> Calling /api/schools will load 5MB+ of data, which is time consuming. Instead you can load schools by district api call.

- The `/api/schools` route is offline-first and serves the snapshot at `data/cbse-schools.json` by default. Use `?online=1` to fetch fresh upstream data.
- The downloader/merge writes a small metadata file at `data/cbse-schools.meta.json` which contains `{ "last_grabbed": "ISO timestamp", "records": number }`. When present the `/api/schools` response will include this metadata and the route sets an `X-Data-Source` header to indicate `offline` or `online`.

### ✅ [Download Postman Collections](https://raw.githubusercontent.com/anburocky3/cbse-schools-data/refs/heads/main/postman/CBSESchools.postman_collection.json)

### Screenshots

![CBSE School List Data - Datasets](/screenshots/1.png)

## Quick start

1. [Fork this repository](https://github.com/anburocky3/cbse-schools-data/fork) and install the deps.

```bash
npm install
npm run dev
```

2. Open the app in your browser:

```
http://localhost:3000
```

## Author

- [Anbuselvan Annamalai](https://fb.me/anburocky3) ([MIT License](/LICENSE))

## Acknowledgement

- All datas are owned by online saras website. Refer it for more clarity!
