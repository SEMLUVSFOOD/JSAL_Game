const corsProxy = 'https://api.allorigins.win/get?url=';
const channelIds = [
  'UCewMTclBJZPaNEfbf-qYMGA', // JackSucksAtLife
  'UCxLIJccyaRQDeyu6RzUsPuw',  // JackSucksAtStuff
  'UCd15dSPPT-EhTXekA7_UNAQ', // JackSucksAtGeography
  'UCyktGLVQchOpvKgL7GShDWA' // JackMasseyWelsh
];

const channelNames = [
  'JackSucksAtLife', 
  'JackSucksAtStuff',
  'JackSucksAtGeography', 
  'JackMasseyWelsh'
];

let correctChannel = '';  // Track the correct channel for the current game round
let usedVideos = new Set();  // Track used video IDs to avoid repetition

// Function to fetch the latest videos from a channel and return a random video ID
function getRandomVideoIdFromChannel(channelId, channelName) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&order=viewCount&part=snippet&type=video&maxResults=50`;

  return fetch(corsProxy + encodeURIComponent(apiUrl))
    .then(response => response.json())
    .then(data => {
      const responseData = JSON.parse(data.contents);  // Parse the actual API response
      if (!responseData.items || responseData.items.length === 0) {
        throw new Error('No videos found');
      }

      // Get the video IDs from the search results
      const videoIds = responseData.items.map(item => item.id.videoId).join(',');

      // Now, make another API request to fetch the content details (including duration) of these videos
      const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=contentDetails,snippet`;

      return fetch(corsProxy + encodeURIComponent(videoDetailsUrl))
        .then(response => response.json())
        .then(detailData => {
          // Filter out videos that are shorter than 60 seconds (YouTube Shorts)
          const longVideos = detailData.items.filter(item => {
            const duration = item.contentDetails.duration;
            const videoDuration = parseDurationToSeconds(duration);

            // Log duration for debugging
            console.log(`Video: ${item.snippet.title} - Duration: ${videoDuration} seconds`);

            return videoDuration > 60;  // Only keep videos longer than 60 seconds
          });

          if (longVideos.length === 0) {
            throw new Error('No valid long videos found');
          }

          // Remove used videos from the list
          const availableVideos = longVideos.filter(video => !usedVideos.has(video.id));

          if (availableVideos.length === 0) {
            // If all videos have been used, reset the usedVideos set
            usedVideos.clear();
          }

          // Pick a random video that has not been used yet
          const randomIndex = Math.floor(Math.random() * availableVideos.length);
          const videoId = availableVideos[randomIndex].id;

          // Mark the video as used
          usedVideos.add(videoId);

          // Set the correct channel for this round
          correctChannel = channelName;

          return videoId;
        });
    })
    .catch(error => {
      console.error('Error fetching YouTube data:', error);
      return null;
    });
}

// Function to convert ISO 8601 duration to seconds (if applicable)
function parseDurationToSeconds(duration) {
  if (!duration) return 0;  // If there's no duration, return 0

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;  // If the duration format is unexpected, return 0

  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

// Function to display a random thumbnail
function displayRandomThumbnail() {
  const randomChannelIndex = Math.floor(Math.random() * channelIds.length);
  const randomChannelId = channelIds[randomChannelIndex];
  const channelName = channelNames[randomChannelIndex];

  // Show the loading image in the thumbnail element while fetching the new thumbnail
  const thumbnailImage = document.getElementById('thumbnail');
  thumbnailImage.src = 'LoadingIMG.png';  // Set loading image

  // Hide the actual thumbnail image while loading
  thumbnailImage.style.display = 'block'; // Make sure the thumbnail image is visible during loading

  getRandomVideoIdFromChannel(randomChannelId, channelName).then(videoId => {
    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      thumbnailImage.src = thumbnailUrl;  // Set the new thumbnail image

      // Optionally, ensure the image is visible after loading
      thumbnailImage.style.display = 'block';
    } else {
      console.error('Could not retrieve video ID');
      thumbnailImage.src = '';  // Reset the thumbnail image if error occurs
    }
  });
}

// Function to check if the user clicked the correct button
function checkAnswer(selectedChannel) {
  if (selectedChannel === correctChannel) {
    alert('Correct! You guessed the right channel!');
    // Move on to a new thumbnail after a correct guess
    displayRandomThumbnail();
  } else {
    alert('Incorrect! Try again.');
  }
}

// Event listeners for the channel buttons
document.querySelectorAll('.channelButtons button').forEach((button, index) => {
  button.addEventListener('click', () => {
    const selectedChannel = channelNames[index];
    checkAnswer(selectedChannel);
  });
});

// Display a random thumbnail when the page loads
window.onload = displayRandomThumbnail;
