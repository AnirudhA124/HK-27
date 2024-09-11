// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const welcomePage = 'add_doc.html';
const mainPage = 'main.html';

// Initialize side panel when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ path: welcomePage });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Update the side panel path when tab is activated and it's currently the welcome page
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const { path } = await chrome.sidePanel.getOptions({ tabId });
  if (path === welcomePage) {
    chrome.sidePanel.setOptions({ path: mainPage });
  }
});

// Handle messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message.type);
  if (message.type === "new_meeting_started") {
    // Saving current tab id to download transcript when this tab is closed
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.storage.local.set({ meetingTabId: tabId }, function () {
        console.log("Meeting tab id saved");
      });
    });
  }
  if (message.type === "download") {
    // Invalidate tab id since transcript is downloaded
    chrome.storage.local.set({ meetingTabId: null }, function () {
      console.log("Meeting tab id cleared");
    });
    downloadTranscript();
  }
  return true;
});

// Download transcript if meeting tab is closed
chrome.tabs.onRemoved.addListener(function (tabid) {
  chrome.storage.local.get(["meetingTabId"], function (data) {
    if (tabid === data.meetingTabId) {
      console.log("Successfully intercepted tab close");
      downloadTranscript();
      // Clearing meetingTabId to prevent misfires of onRemoved until next meeting actually starts
      chrome.storage.local.set({ meetingTabId: null }, function () {
        console.log("Meeting tab id cleared for next meeting");
      });
    }
  });
});

// Function to download the transcript
function downloadTranscript() {
  chrome.storage.local.get(["userName", "transcript", "chatMessages", "meetingTitle", "meetingStartTimeStamp"], function (result) {
    if (result.userName && result.transcript && result.chatMessages) {
      // Create file name if values are provided, use default otherwise
      const fileName = result.meetingTitle && result.meetingStartTimeStamp
        ? `Octavian/Transcript-${result.meetingTitle} at ${result.meetingStartTimeStamp}.txt`
        : `Octavian/Transcript.txt`;

      // Create an array to store lines of the text file
      const lines = [];

      // Iterate through the transcript array and format each entry
      result.transcript.forEach(entry => {
        lines.push(`${entry.personName} (${entry.timeStamp})`);
        lines.push(entry.personTranscript);
        // Add an empty line between entries
        lines.push("");
      });
      lines.push("");
      lines.push("");

      if (result.chatMessages.length > 0) {
        // Iterate through the chat messages array and format each entry
        lines.push("---------------");
        lines.push("CHAT MESSAGES");
        lines.push("---------------");
        result.chatMessages.forEach(entry => {
          lines.push(`${entry.personName} (${entry.timeStamp})`);
          lines.push(entry.chatMessageText);
          // Add an empty line between entries
          lines.push("");
        });
        lines.push("");
        lines.push("");
      }


      // Join the lines into a single string, replace "You" with userName from storage
      const textContent = lines.join("\n").replace(/You \(/g, result.userName + " (")

      // Create a blob containing the text content
      const blob = new Blob([textContent], { type: "text/plain" });

      // Read the blob as a data URL
      const reader = new FileReader();

      // Download once blob is read
      reader.onload = function (event) {
        const dataUrl = event.target.result;

        // Create a download with Chrome Download API
        chrome.downloads.download({
          url: dataUrl,
          filename: fileName,
          conflictAction: "uniquify"
        }).then(() => {
          console.log("Transcript downloaded to Octavian directory");
        }).catch((error) => {
          console.log(error);
          chrome.downloads.download({
            url: dataUrl,
            filename: "Octavian/Transcript.txt",
            conflictAction: "uniquify"
          });
          console.log("Invalid file name. Transcript downloaded to Octavian directory with simple file name.");
        });
      };

      // Read the blob and download as text file
      reader.readAsDataURL(blob);
    } else {
      console.log("No transcript found");
    }
  });
}