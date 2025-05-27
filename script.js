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

      // Filter out videos that are less than 60 seconds (Shorts)
      const longVideos = responseData.items.filter(item => item.snippet.title && item.snippet.title.length > 0);

      if (longVideos.length === 0) {
        throw new Error('No valid long videos found');
      }

      // Remove used videos from the list
      const availableVideos = longVideos.filter(video => !usedVideos.has(video.id.videoId));

      if (availableVideos.length === 0) {
        // If all videos have been used, reset the usedVideos set
        usedVideos.clear();
      }

      // Pick a random video that has not been used yet
      const randomIndex = Math.floor(Math.random() * availableVideos.length);
      const videoId = availableVideos[randomIndex].id.videoId;

      // Mark the video as used
      usedVideos.add(videoId);

      // Set the correct channel for this round
      correctChannel = channelName;

      return videoId;
    })
    .catch(error => {
      console.error('Error fetching YouTube data:', error);
      return null;
    });
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
