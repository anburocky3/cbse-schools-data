# CBSE School List — (Data via API)

[![Stars](https://img.shields.io/github/stars/anburocky3/cbse-schools-data)](https://github.com/anburocky3/cbse-schools-data)
[![Forks](https://img.shields.io/github/forks/anburocky3/cbse-schools-data)](https://github.com/anburocky3/cbse-schools-data)
[![GitHub license](https://img.shields.io/github/license/anburocky3/cbse-schools-data)](https://github.com/anburocky3/cbse-schools-data)
![Anbuselvan Rocky Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fanburocky3%2Fcbse-schools-data)
[![Support Server](https://img.shields.io/discord/742347296091537448.svg?label=Discord&logo=Discord&colorB=7289da)](https://discord.gg/6ktMR65YMy)
[![Cyberdude youtube](https://img.shields.io/youtube/channel/subscribers/UCteUj8bL1ppZcS70UCWrVfw?style=social)](https://www.youtube.com/c/cyberdudenetworks)

This api contains 31000+ cbse school data, like names, district, address, etc., including inauguration_date with current principal details across India. The data is sourced from the CBSE Saras website.

> You can download the [entire data-set here](https://raw.githubusercontent.com/anburocky3/cbse-schools-data/refs/heads/main/data/schools.json). If you are looking for Indian Colleges/Instituitions [Check here](https://github.com/anburocky3/indian-colleges-data/fork)

### Screenshots

![CBSE School List Data - Datasets](/screenshots/1.png)

> Note: This project is not affiliated with or endorsed by any government entity. Data comes from publicly available pages and may change or break at any time.

## 🚀 Available Endpoints

- 👉 [GET - /api/schools - List all CBSE Schools](https://cbse-schools.netlify.app/api/schools)
- 👉 [GET - /api/schools/{affiliatedId} - Get Detailed School Info](https://cbse-schools.netlify.app/api/schools/1930706)
- 👉 [GET - /api/states - List available states ](https://cbse-schools.netlify.app/api/states)
- 👉 [GET - /api/states/{state} - Get districts of that state](https://cbse-schools.netlify.app/api/states/19)
- 👉 [GET - GET /api/states/{state}/{district} - List all schools on that district](https://cbse-schools.netlify.app/api/states/19/03)

> Calling `/api/schools` will return the offline snapshot from `data/schools.json` (12.8MB). Prefer filtered calls (by state/district/status) for faster responses.

- The downloader/merge scripts write per-status files and a merged snapshot at `data/schools.json`. Each per-status file has a `meta` object with `count` and `last_grabbed` timestamps. The merged file contains `meta` with `statuses` and `total_unique`.

### ✅ [Download Postman Collections](https://raw.githubusercontent.com/anburocky3/cbse-schools-data/refs/heads/main/postman/CBSESchools.postman_collection.json)

## Quick start

1. [Fork this repository](https://github.com/anburocky3/cbse-schools-data/fork) and install the deps.

```bash
npm install
npm run dev
```

Run the data grab and merge scripts (optional — requires a valid RequestVerificationToken/cookie in `scripts/fetchRemoteData.ts`):

```cmd
npm run grab:data
npm run merge:data
```

2. Open the app in your browser:

```
http://localhost:3000
```

## Author

- [Anbuselvan Annamalai](https://fb.me/anburocky3) ([MIT License](/LICENSE))

## Acknowledgement

- All datas are owned by online saras website. Refer it for more clarity!
