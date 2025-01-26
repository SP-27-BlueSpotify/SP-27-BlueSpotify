# SP-27-BlueSpotify

#### Table of Contents
-[Overview](#overview)
-[Team Members](#team-members)
-[Cloning](#cloning)
-[Branch and Push Rules](#branch-and-push-rules)
-[Pull Requests](#pull-requests)

## Overview
This will serve as our implementation for the Spotify application. This README will have notes about a few things, such as branch and push rules and will expand as needed. Please read the entire README. Thanks :)

## Team Members
- Will provide names of team members and GitHub accounts

## Cloning
Read through the entire README file in the repository before cloning!!
1. Install the latest version of Node.js and Node Package Manager (NPM).
2. Verify your install
```bash
# verifies the right Node.js version is in the environment
node -v # should print `v23.6.0`

# verifies the right NPM version is in the environment
npm -v # should print `11.0.0`

```
3. Clone the GitHub repository. Using the command-line you can run,
```bash
git clone <repository_url>
```
Then switch to the develop branch by running, 
```bash
git checkout develop 
```

4. Run the project locally
```bash
cd SP-27-BlueSpotify
npm start
```

5. Will add more resources here for installing iOS emulator on Mac. Scan the QR code to test it on your device after downloading the Expo Go app. You can also test the project on Web. 

## Branch and Push Rules 
1. Do not push directly to main or develop. Please open a Pull request (PR) and have it reviewed by Trey. This is to stick to agile prinicples and ensure testing and quality. Please see the PR section on how to submit a PR.
2. Do not check any files in that might have sensitive information i.e. API keys. Do not hard code any API keys directly into your code and instead use a .env file and DO NOT check this file into your PR. Any PRs with hard-coded API keys will be rejected or requested to be changed. 
3. Branch naming will be as follows... when working on a feature for the project, you will name your branch "feature/nameOfFeature" where "nameOfFeature" will be the name of the feature you are working on. So say you are adding a button to the main homepage of the application, you will call your branch "feature/MainPageButton". Make sure to base allbranches off of the develop branch. All PRs that are opened will be merged to the develop branch first. After ensuring that the project is working correctly after many new features, we will then merge into main for our final project. 


## Pull Requests
We will try our best to adhear to the Git Flow work flow when working on our project. [Link here](https://www.gitkraken.com/learn/git/git-flow) When opening a PR, make sure you are trying to merge into the develop branch, and not the main branch. Give your PR a descriptive name including the name of the branch. For example, "feature/MainPageButton | Adding a Button to the Main Page". Then, make sure you add screenshots or a video of your changes (video not required) to make it easy to know what the changes are. In the PR make sure to add comments about what your changes do and make sure that you tested as much as possible. Then when you are ready, request a review from Trey and he will get your PR reviewed and merged into develop within 1-2 days. 
