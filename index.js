import fetch from "node-fetch";
import "dotenv/config";

//Go to: https://gitlab.com/profile/personal_access_tokens
const API_KEY = process.env.API_KEY;

//You can find project id inside the "General project settings" tab
const PROJECT_ID = process.env.PROJECT_ID;
const PROJECT_URL = "https://gitlab.com/api/v4/projects/" + PROJECT_ID + "/";

let jobs = [];

async function sendApi(url, options = {}) {
  if (!options.headers) options.headers = {};
  options.headers["PRIVATE-TOKEN"] = API_KEY;

  return fetch(url, options);
}

async function runJobs() {
  for (let i = 0, currentJobs = []; i == 0 || currentJobs.length > 0; i++) {
    currentJobs = await sendApi(
      PROJECT_URL + "jobs/?per_page=100&page=" + (i + 1)
    ).then((res) => res.json());
    jobs = jobs.concat(currentJobs);
  }

  //skip jobs without artifacts
  jobs = jobs.filter((e) => e.artifacts);

  //keep the latest build.
  jobs.shift();

  for (let job of jobs)
    sendApi(PROJECT_URL + "jobs/" + job.id + "/artifacts", {
      method: "DELETE",
    });
}

runJobs();
