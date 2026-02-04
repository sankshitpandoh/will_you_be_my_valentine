function controlVideoInIframe(shouldPlay) {
  const iframe = document.querySelector('.year-iframe');
  if (iframe) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const video = iframeDoc.getElementById('celebration-video');
      const celebrationScreen = iframeDoc.getElementById('celebration-screen');
      
      if (video) {
        if (shouldPlay) {
          // Only resume video if celebration screen is active
          if (celebrationScreen && celebrationScreen.classList.contains('active')) {
            video.play().catch(e => {
              console.log('Video play failed:', e);
            });
          }
        } else {
          // Pause video when switching away from 2026 section
          video.pause();
        }
      }
    } catch (e) {
      // Cross-origin or iframe not loaded yet - use postMessage
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ 
          type: 'videoControl', 
          action: shouldPlay ? 'play' : 'pause',
          checkCelebration: shouldPlay // Flag to check celebration screen
        }, '*');
      }
    }
  }
}

function setActiveYear(year) {
  const tabs = document.querySelectorAll(".year-tab");
  const panels = document.querySelectorAll(".year-content");

  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.year === year);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.year === year);
  });

  // Control video playback based on active section
  controlVideoInIframe(year === '2026');
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".year-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveYear(tab.dataset.year);
    });
  });

  // Handle iframe load - check if 2026 section is active and control video accordingly
  const iframe = document.querySelector('.year-iframe');
  if (iframe) {
    iframe.addEventListener('load', () => {
      const year2026Panel = document.querySelector('.year-content[data-year="2026"]');
      if (year2026Panel && year2026Panel.classList.contains('is-active')) {
        // If 2026 is active when iframe loads, check if celebration screen is active before playing
        setTimeout(() => {
          controlVideoInIframe(true);
        }, 500); // Small delay to ensure iframe content is ready
      } else {
        // If another section is active, pause video
        controlVideoInIframe(false);
      }
    });
  }
});

function showMessage(response) {
    let videoPlayed = false;
    if (response === "No") {
      const noButton = document.getElementById("no-button");
      const maxWidth = window.innerWidth - noButton.offsetWidth;
      const maxHeight = window.innerHeight - noButton.offsetHeight;
  
      // Set the button position to absolute
      noButton.style.position = "absolute";
  
      // Change the image source to "gun.gif"
      document.getElementsByClassName("image")[0].src = "images/gun.gif";
  
      // Generate random coordinates within the visible container
      const randomX = Math.max(0, Math.floor(Math.random() * maxWidth));
      const randomY = Math.max(0, Math.floor(Math.random() * maxHeight));
  
      // Apply the new coordinates to the button
      noButton.style.left = randomX + "px";
      noButton.style.top = randomY + "px";
  
      // Update text content and hide the name message
      document.getElementById("question").textContent =
        "Choose wisely";
      document.getElementById("name").style.display = "none";
  
      // Add a mouseover event listener to the "No" button
      noButton.addEventListener("mouseover", () => {
        if (!videoPlayed) {
          const videoElement = document.createElement("video");
          videoElement.src = "./Maroon 5 - Sugar.mp4#t=42";
          videoElement.autoplay = true;
          videoElement.controls = false;
          document.body.appendChild(videoElement);
          videoElement.style.position = "fixed";
          videoElement.style.top = "40%";
          videoElement.style.left = "50%";
          videoElement.style.transform = "translate(-50%, -50%)";
          videoElement.style.width = "700px"
          document.body.appendChild(videoElement);
          // Set the flag to true after playing the video
          videoPlayed = true;
        }
  
        // Generate new random coordinates when the button is hovered
        const randomX = Math.max(0, Math.floor(Math.random() * maxWidth));
        const randomY = Math.max(0, Math.floor(Math.random() * maxHeight));
  
        noButton.style.zIndex = "100";
        // Apply new coordinates to the button, causing it to move
        noButton.style.left = randomX + "px";
        noButton.style.top = randomY + "px";
      });
    }
  
    if (response === "Yes") {
        const videos = document.getElementsByTagName("video");

        console.log(videos);
        
        if (videos.length > 0) {
            Array.from(videos).forEach(video => video.remove());
        }
        
      // Remove the name message and the "No" button
      document.getElementById("name").remove();
      document.getElementById("no-button").remove();
      const videoElement = document.querySelector("video");
      if (videoElement) {
        videoElement.pause();
        videoElement.remove();
      }
  
      // Create an audio element to play the sound
      const audioElement = document.createElement("audio");
      audioElement.src = "./Minions Cheering.mp4"; // Source of the sound
      audioElement.preload = "auto"; // Preloading the audio
      audioElement.play() // Play the sound
        .catch(e => console.error("Audio playback failed:", e)); // Catch and log playback errors
  
      // Update the text content, display the message, and change the image to "dance.gif"
      const yesMessage = document.getElementById("question");
      yesMessage.textContent = "See you on the 14th my princess";
      yesMessage.style.display = "block";
      yesMessage.style.fontStyle = "normal";
      yesMessage.style.color = "#fff";
      yesMessage.style.webkitTextStroke = "0px #fff";
      yesMessage.style.setProperty("-webkit-text-stroke", "none");

      document.getElementsByClassName("image")[0].src = "images/dance.gif";
      document.getElementsByTagName("body")[0].style.background = "url('images/image-1.gif') repeat";
  
      // Remove the "Yes" button
      document.getElementById("yesButton").remove();
    }
  
  }
  