// Use AllOrigins as a proxy to bypass CORS restrictions
const corsProxy = 'https://api.allorigins.win/get?url=';

// YouTube Channel IDs (You can find these from each channel's URL)
const channelIds = [
    'UCyktGLVQchOpvKgL7GShDWA', // JackMasseyWelsh
    'UCd15dSPPT-EhTXekA7_UNAQ', // JackSucksAtGeography
    'UCewMTclBJZPaNEfbf-qYMGA', // JackSucksAtLife
    'UCxLIJccyaRQDeyu6RzUsPuw'  // JackSucksAtStuff
];

// Function to fetch the latest videos from a channel and return a random video ID
function getRandomVideoIdFromChannel(channelId) {
    // Updated API request: reduced maxResults and switched to viewCount ordering
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&order=viewCount&part=snippet&type=video&maxResults=10`;

    // Use AllOrigins proxy to make the request
    return fetch(corsProxy + encodeURIComponent(apiUrl))
        .then(response => response.json())
        .then(data => {
            // Log the raw response to debug the structure
            console.log('Raw API Response:', data);

            // Check if the response contains valid data
            const responseData = JSON.parse(data.contents); // Parse the actual API response
            if (!responseData.items || responseData.items.length === 0) {
                throw new Error('No videos found in the API response');
            }

            const videos = responseData.items;
            const randomIndex = Math.floor(Math.random() * videos.length);
            const videoId = videos[randomIndex].id.videoId;

            return videoId;
        })
        .catch(error => {
            console.error('Error fetching YouTube data:', error);
            return null;
        });
}

// Function to set the random thumbnail once the video ID is retrieved
function displayRandomThumbnail() {
    const randomChannelId = channelIds[Math.floor(Math.random() * channelIds.length)];

    getRandomVideoIdFromChannel(randomChannelId).then(videoId => {
        if (videoId) {
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            const thumbnailImage = document.getElementById('thumbnail');
            thumbnailImage.src = thumbnailUrl;
        } else {
            console.error('Could not retrieve video ID');
        }
    });
}

// Display a random thumbnail when the page loads
window.onload = displayRandomThumbnail;
