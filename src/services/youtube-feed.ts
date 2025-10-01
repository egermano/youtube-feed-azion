import { XMLParser } from "fast-xml-parser";

export const isValidYoutubeChannelUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);

    // 1. Verifica se é do YouTube
    const validHosts = ["youtube.com", "www.youtube.com"];
    if (!validHosts.includes(url.hostname)) {
      return false;
    }

    // 2. Caminhos válidos para canais
    const validChannelPaths = [
      /^\/@[\w\-]+$/, // ex: /@egermano
      /^\/channel\/[\w\-]+$/, // ex: /channel/UCxxxx
      /^\/user\/[\w\-]+$/, // ex: /user/egermano
      /^\/c\/[\w\-]+$/, // ex: /c/egermano
      /^\/[\w\-]+$/, // ex: /egermano (curto)
    ];

    // 3. Verifica se o pathname corresponde a um canal
    return validChannelPaths.some((regex) => regex.test(url.pathname));
  } catch (err) {
    return false; // URL inválida
  }
};

export const getExternalId = async (youtubeUrl: string): Promise<string> => {
  try {
    const res = await fetch(youtubeUrl);
    const html = await res.text();

    // Busca o trecho que contém "externalId"
    const match = html.match(/"externalId":"(UC[^\"]+)"/);

    if (match && match[1]) {
      return match[1];
    } else {
      throw new Error("Unable to find externalId");
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error on finding externalId:", err.message);
    } else {
      console.error("Error on finding externalId:", err);
    }

    throw new Error("Unable to find externalId");
  }
};

const fetchFeed = async (channelId: string) => {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        headers: {
          "Content-Type": "text/xml; charset=UTF-8",
          accept: "text/xml; charset=UTF-8",
          pragma: "no-cache",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );
    const data = await response.text();

    return data;
  } catch (err) {
    const newErr = new Error("Error fetching youtube channel feed.");
    throw Object.assign(newErr, err);
  }
};

export const getChannelFeed = async (channelId: string) => {
  // TODO: Improve the channel ID validation
  if (!channelId || channelId.length < 1) {
    throw new Error("Invalid channel ID");
  }

  const feedData = await fetchFeed(channelId);

  try {
    const parser = new XMLParser();
    const { feed } = parser.parse(feedData);

    const { author: authors, entry: videos, title } = feed;
    console.log(authors, videos, title);

    const links = feed.link?.map((link: { $: string }) => link.$);

    return { authors, videos, links, title: title[0] };
    // return feed;
  } catch (err) {
    console.log(err);
    const newErr = new Error("Error parsing youtube channel feed data.");
    throw Object.assign(newErr, err);
  }
};

export const getChannelVideos = async (channelId: string) => {
  try {
    const { videos } = await getChannelFeed(channelId);

    return videos;
  } catch (error) {
    console.log(error);
  }
};

export const getLastVideo = async (channelId: string) => {
  try {
    const { videos } = await getChannelFeed(channelId);

    return videos?.[0];
  } catch (error) {
    console.log(error);
  }
};

export const getLatestVideos = async (channelId: string) => {
  const { videos } = await getChannelFeed(channelId);

  return videos;
};
