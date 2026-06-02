/**
 * Vantage Automated GitHub Uploader
 * Uploads project files directly using the GitHub REST API (No Git CLI required!)
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DIRECT_TOKEN = "";     // Example: "ghp_xxxxxxxxxxxxxx"
const DIRECT_USERNAME = "";  // Example: "yourusername"
// ------------------------------------------------------------

const IGNORE_LIST = [
  "node_modules",
  "dist",
  ".git",
  ".env",
  "package-lock.json",
  "upload.js",
  "push-to-github.js",
  "push.js"
];

function makeGitHubRequest({ method, urlPath, token, body, username }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const options = {
      hostname: "api.github.com",
      path: urlPath,
      method: method,
      headers: {
        "User-Agent": "Vantage-Uploader",
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      }
    };

    if (body) {
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseBody || "{}"));
        } else {
          try {
            const errJson = JSON.parse(responseBody);
            reject(new Error(errJson.message || `HTTP Error ${res.statusCode}`));
          } catch {
            reject(new Error(`HTTP Error ${res.statusCode}: ${responseBody}`));
          }
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    if (body) {
      req.write(payload);
    }
    req.end();
  });
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (IGNORE_LIST.includes(file)) return;

    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function startUploader() {
  console.log("\n=======================================================");
  console.log("⚡ VANTAGE AUTOMATED GITHUB UPLOADER ⚡");
  console.log("=======================================================\n");

  console.log("To upload this project, you need a GitHub Personal Access Token.");
  console.log("👉 How to get one in 30 seconds:");
  console.log("1. Open Chrome and go to: https://github.com/settings/tokens");
  console.log("2. Click 'Generate new token' -> select 'Generate new token (classic)'.");
  console.log("3. Give it a name (e.g. Vantage), check 'repo' permission, and scroll down to click 'Generate token'.");
  console.log("4. Copy the token string (it will start with 'ghp_').\n");

  const envToken = DIRECT_TOKEN || process.env.GITHUB_TOKEN || "";
  const tokenPrompt = envToken ? " [detected, press Enter]" : "";

  rl.question(`🔑 Paste your GitHub Token${tokenPrompt}: `, async (tokenInput) => {
    const token = (tokenInput.trim() || envToken).trim();
    if (!token) {
      console.log("❌ Error: Token is required.");
      rl.close();
      return;
    }

    const envUsername = DIRECT_USERNAME || process.env.GITHUB_USERNAME || "";
    const usernamePrompt = envUsername ? ` [detected: ${envUsername}, press Enter]` : "";

    rl.question(`👤 Enter your GitHub Username${usernamePrompt}: `, async (usernameInput) => {
      const username = (usernameInput.trim() || envUsername).trim();
      if (!username) {
        console.log("❌ Error: Username is required.");
        rl.close();
        return;
      }

      rl.question("📁 Enter Repository Name [nexus-competitor-lead-analyzer]: ", async (repoInput) => {
        let repoName = repoInput.trim();
        if (!repoName) {
          repoName = "nexus-competitor-lead-analyzer";
        }

        console.log("\n📡 Creating public repository on your GitHub account...");

        try {
          // 1. Create Repository
          await makeGitHubRequest({
            method: "POST",
            urlPath: "/user/repos",
            token,
            body: {
              name: repoName,
              private: false,
              description: "Vantage Market Intelligence & Lead Discovery Suite"
            }
          });
          console.log(`✅ Repository '${repoName}' created successfully!`);
        } catch (err) {
          if (err.message.includes("already exists") || err.message.includes("Repository creation failed")) {
            console.log(`ℹ️ Repository '${repoName}' already exists. Preparing file updates...`);
          } else {
            console.error("❌ Failed to create repository:", err.message);
            rl.close();
            return;
          }
        }

        // 2. Scan and upload files
        const projectRoot = __dirname;
        console.log("\n🔎 Scanning directory files...");
        const allFiles = getAllFiles(projectRoot);
        console.log(`📁 Found ${allFiles.length} files to upload.`);

        for (let i = 0; i < allFiles.length; i++) {
          const filePath = allFiles[i];
          const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, "/");
          const fileContent = fs.readFileSync(filePath);
          const base64Content = fileContent.toString("base64");

          console.log(`📤 Uploading [${i + 1}/${allFiles.length}] : ${relativePath}...`);

          try {
            // Check if file exists to get SHA for updates
            let sha = "";
            try {
              const fileData = await makeGitHubRequest({
                method: "GET",
                urlPath: `/repos/${username}/${repoName}/contents/${relativePath}`,
                token
              });
              sha = fileData.sha;
            } catch {
              // File doesn't exist yet, which is perfect
            }

            // Put file contents
            const uploadBody = {
              message: `Upload ${relativePath}`,
              content: base64Content
            };
            if (sha) {
              uploadBody.sha = sha;
            }

            await makeGitHubRequest({
              method: "PUT",
              urlPath: `/repos/${username}/${repoName}/contents/${relativePath}`,
              token,
              body: uploadBody
            });

          } catch (uploadErr) {
            console.error(`❌ Failed to upload ${relativePath}:`, uploadErr.message);
          }
        }

        console.log("\n=======================================================");
        console.log("🎉 SUCCESS! PROJECT UPLOADED TO GITHUB!");
        console.log(`🔗 Live URL: https://github.com/${username}/${repoName}`);
        console.log("=======================================================\n");
        rl.close();
      });
    });
  });
}

startUploader();
