const { google } = require("googleapis");
const readline = require("readline-promise").default;
const fs = require("fs");
const chokidar = require("chokidar");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_PATH = "token.json";

/**
 * Starts monitoring the specified directory for new files
 * and uploads them to the specified Google Drive folder.
 * @param {string} clientId - Google API client ID.
 * @param {string} clientSecret - Google API client secret.
 * @param {string} redirectUri - Redirect URI for OAuth flow.
 * @param {string} folderId - ID of the Google Drive folder to upload files to.
 * @param {string} watchPath - Path of the directory to monitor for new files.
 */
async function syncDirectoryWithGoogleDrive(
  clientId,
  clientSecret,
  redirectUri,
  folderId,
  watchPath
) {
  // Set up authentication
  const auth = await getAuth(clientId, clientSecret, redirectUri);

  // Start monitoring the directory for new files
  startFileMonitoring(auth, folderId, watchPath);
}

/**
 * Sets up authentication with Google Drive.
 * @param {string} clientId - Google API client ID.
 * @param {string} clientSecret - Google API client secret.
 * @param {string} redirectUri - Redirect URI for OAuth flow.
 * @returns {Promise<google.auth.OAuth2>} - Authenticated OAuth2 client.
 */
async function getAuth(clientId, clientSecret, redirectUri) {
  // Create OAuth2 client
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Check if token exists
  const token = await readToken();

  if (token) {
    // Set credentials if token exists
    auth.setCredentials(token);
  } else {
    // Generate token if token does not exist
    await generateToken(auth);
  }

  return auth;
}

/**
 * Reads token from file.
 * @returns {Promise<Object|null>} - Parsed token or null if token file does not exist.
 */
function readToken() {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        // If token file does not exist, return null
        resolve(null);
      } else {
        // Parse token and return
        resolve(JSON.parse(token));
      }
    });
  });
}

/**
 * Generates a new OAuth token.
 * @param {google.auth.OAuth2} auth - OAuth2 client.
 * @returns {Promise<void>}
 */
async function generateToken(auth) {
  // Generate authorization URL
  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this URL:", authUrl);

  // Prompt user to enter authorization code
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await rl.questionAsync("Enter the code from that page here: ");
  rl.close();

  // Exchange authorization code for access token
  const token = await auth.getToken(code);

  // Set credentials and save token to file
  auth.setCredentials(token.tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token.tokens));
}

/**
 * Starts monitoring the specified directory for new files
 * and uploads them to the specified Google Drive folder.
 * @param {google.auth.OAuth2} auth - Authenticated OAuth2 client.
 * @param {string} folderId - ID of the Google Drive folder to upload files to.
 * @param {string} watchPath - Path of the directory to monitor for new files.
 */
function startFileMonitoring(auth, folderId, watchPath) {
  // Create Google Drive API client
  const drive = google.drive({ version: "v3", auth });

  // Watch the specified directory for new files
  const watcher = chokidar.watch(watchPath, {
    ignored: /^\./,
    persistent: true,
  });

  // When a new file is added, upload it to Google Drive
  watcher.on("add", async (filePath) => {
    const fileName = filePath.split("/").pop();

    // Check if the file has already been uploaded
    const existingFiles = await drive.files.list({
      q: `'${folderId}' in parents`,
    });
    const isFileUploaded = existingFiles.data.files.some(
      (file) => file.name === fileName
    );

    if (!isFileUploaded) {
      // Create file metadata
      const fileMetadata = { name: fileName, parents: [folderId] };
      const media = { body: fs.createReadStream(filePath) };

      // Upload file to Google Drive
      drive.files.create({ requestBody: fileMetadata, media }, (err, res) => {
        if (err) {
          console.error("Error uploading the file:", err);
          return;
        }
        console.log("File uploaded successfully.", res.data.id);
      });
    }
  });

  console.log("File monitoring started. Waiting for new files...");
}

module.exports = syncDirectoryWithGoogleDrive;
