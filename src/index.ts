import { Hono } from "hono";
import { getChannelVideos, getExternalId, getLastVideo, isValidYoutubeChannelUrl } from "./services/youtube-feed";

const app = new Hono();

// TODO: improve query validation and refactoring similar logic in differente routes

app.get("/", async (c) => {
  let channelId = c.req.query("channelId");
  const channelUrl = c.req.query("channelUrl");

  if (!channelId && !channelUrl) {
    return c.json(
      { error: "Missing query parameter use channelId or channelUrl" },
      400
    );
  }

  if (channelId && channelUrl) {
    return c.json(
      { error: "Use only one query parameter channelId or channelUrl" },
      400
    );
  }

  if (channelUrl && !channelId) {
    const url = isValidYoutubeChannelUrl(channelUrl);
    if (!url) {
      return c.json({ error: "Invalid Youtube channel URL" }, 400);
    }

    channelId = (await getExternalId(channelUrl)) as string;
  }

  if (!channelId) {
    return c.json({ error: "Unable to validate the Youtube channel ID" }, 400);
  }

  try {
    const video = await getChannelVideos(channelId);

    return c.json(video);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: errorMessage }, 500);
  }
});

app.get("/last-video", async (c) => {
  let channelId = c.req.query("channelId");
  const channelUrl = c.req.query("channelUrl");

  if (!channelId && !channelUrl) {
    return c.json(
      { error: "Missing query parameter use channelId or channelUrl" },
      400
    );
  }

  if (channelId && channelUrl) {
    return c.json(
      { error: "Use only one query parameter channelId or channelUrl" },
      400
    );
  }

  if (channelUrl && !channelId) {
    const url = isValidYoutubeChannelUrl(channelUrl);
    if (!url) {
      return c.json({ error: "Invalid Youtube channel URL" }, 400);
    }

    channelId = (await getExternalId(channelUrl)) as string;
  }

  if (!channelId) {
    return c.json({ error: "Unable to validate the Youtube channel ID" }, 400);
  }
  
  try {
    const video = await getLastVideo(channelId);

    return c.json(video);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: errorMessage }, 500);
  }
});

app.fire();
