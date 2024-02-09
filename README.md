# Google Drive Sync Module

## Introduction

The Google Drive Sync Module is a Node.js package designed to simplify the process of synchronizing a local directory with a Google Drive folder. It provides functionality to monitor a specified directory for new files and automatically upload them to a designated Google Drive folder. This README guide will walk you through the setup, configuration, and usage of the module.

## Installation

To install the Google Drive Sync Module, ensure you have Node.js installed on your system. You can then install the package via npm:

```bash
npm install google-drive-sync-directory
```

## Setting up Google API Credentials

Before using the module, you need to set up the necessary credentials to access Google APIs. Follow these steps to obtain and configure the required credentials:

1. **Google API Console**: Go to the Google API Console and create or select a project.

2. **Enable APIs**: Enable the Google Drive API and any other required APIs for your project.

3. **Create OAuth Client ID**: Navigate to the "Credentials" section and create an OAuth client ID. Select "Desktop app" as the application type.

4. **Download Credentials**: Download the credentials file in JSON format. This file contains the required information for authentication.

5. **Update Environment Variables**: Open the `.env` file in your project directory and update the following variables with the values from the downloaded credentials file:
   - `CLIENT_ID`: Replace with the "Client ID" value.
   - `CLIENT_SECRET`: Replace with the "Client Secret" value.
   - `REDIRECT_URL`: Replace with the redirect URL value.
   - `DRIVE_FOLDER_ID`: Replace with the ID of the Google Drive folder you want to synchronize with.
        - To get the `DRIVE_FOLDER_ID` for your Google Drive folder, follow these steps:

        1. Navigate to Google Drive.
        2. Locate the desired folder you want to synchronize with.
        3. Right-click on the folder and select "Get link" or "Share".
        4. The folder ID will be present in the URL after the `/folders/` or `/drive/folders/` part. It will typically be a long string of characters like this `1RI64MLhHqF7XL_8MZOxYLL5d0cMWtLKH`.
   - `WATCH_PATH`: Replace with the local folder path you want to monitor.
        

## How to use

To use the Google Drive Sync Module in your Node.js project, import it and call the `syncDirectoryWithGoogleDrive` function with the required parameters:

```javascript
const syncDirectoryWithGoogleDrive = require("google-drive-sync-directory");

const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";
const redirectUri = "http://localhost"; // Set this to the callback URL in your OAuth settings
const folderId = "YOUR_FOLDER_ID";
const watchPath = "./path/to/monitor";

syncDirectoryWithGoogleDrive(clientId, clientSecret, redirectUri, folderId, watchPath)
  .catch((error) => {
    console.error("An error occurred:", error);
  });
```

Replace `YOUR_CLIENT_ID`, `YOUR_CLIENT_SECRET`, `YOUR_FOLDER_ID`, and `WATCH_PATH` with your own values.

## Authorization

If the application asks for authorization, follow these steps:

1. Click on the URL displayed in the terminal to grant permissions to the application.

2. After granting permissions, copy the authorization code from the redirected URL and paste it into the terminal.

3. The code will be exchanged for an access token, which will be saved to a file for future use.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

The Google Drive Sync Module utilizes the `googleapis`, `readline-promise`, and `chokidar` npm packages for Google Drive API integration, OAuth flow, and file system monitoring, respectively. We acknowledge and appreciate the contributions of the developers of these packages.