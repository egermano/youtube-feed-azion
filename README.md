# Youtube Channel Data Edge Service

This service is responsible for fetching the data from the Youtube Feed and parse it to json format.

## How to run the service

1. Clone the repository
2. Run the following command to install the dependencies

```bash
npm install
```

3. Run the following command to start the service

```bash
npx azion dev
```

4. The service will be running on the port 3000

## Endpoints

### GET /?channelId OR /?channelUrl

This endpoint is responsible for fetching the data from the Youtube Feed and parse it to json format.

### GET /last-video?channelId or /last-video?channelUrl

This endpoint is responsible for fetching the last video from the Youtube Feed and parse it to json format.
