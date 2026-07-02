// Instagram hashtag feed API
// Fetches recent posts tagged with #HumanoidBridalWalk via Instagram Graph API
//
// Required env vars (set in Vercel dashboard):
//   INSTAGRAM_ACCESS_TOKEN - Long-lived token from Facebook Developer portal
//   INSTAGRAM_USER_ID - Your Instagram Business/Creator account user ID
//
// Setup:
// 1. Go to developers.facebook.com → create an app → add Instagram Graph API
// 2. Connect your Instagram Business/Creator account
// 3. Generate a long-lived access token
// 4. Add both env vars in Vercel project settings

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export function OPTIONS() {
  return new Response(null, { status: 200, headers });
}

export async function GET(request) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return new Response(JSON.stringify({ posts: [], error: 'not_configured' }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Step 1: Get hashtag ID for #HumanoidBridalWalk
    const hashtagRes = await fetch(
      `https://graph.facebook.com/v21.0/ig_hashtag_search?user_id=${userId}&q=HumanoidBridalWalk&access_token=${token}`
    );
    const hashtagData = await hashtagRes.json();

    if (!hashtagData.data || hashtagData.data.length === 0) {
      return new Response(JSON.stringify({ posts: [] }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const hashtagId = hashtagData.data[0].id;

    // Step 2: Get recent media for this hashtag
    const mediaRes = await fetch(
      `https://graph.facebook.com/v21.0/${hashtagId}/recent_media?user_id=${userId}&fields=id,media_url,permalink,caption,media_type,thumbnail_url,timestamp&limit=12&access_token=${token}`
    );
    const mediaData = await mediaRes.json();

    if (!mediaData.data) {
      return new Response(JSON.stringify({ posts: [] }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Format posts
    const posts = mediaData.data.map(post => ({
      id: post.id,
      url: post.permalink,
      image: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
      type: post.media_type,
      caption: post.caption ? post.caption.substring(0, 120) : '',
      timestamp: post.timestamp,
    }));

    return new Response(JSON.stringify({ posts }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ posts: [], error: 'fetch_failed' }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
