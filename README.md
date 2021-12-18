# chatApp

ChatApp is a project that we started to get familiar with Websockets and their implementation with Socket.IO.

The [chatApp](https://chatapp-420.herokuapp.com) is hosted using Heroku at - https://chatapp-420.herokuapp.com

---

#### For guidelines on how to contribute, check out [CONTRIBUTING.md](https://github.com/osBins/chatApp/blob/main/CONTRIBUTING.md) 

# First Contributions

This project aims to simplify and guide the way beginners make their first contribution. If you are looking to make your first contribution, follow the steps below.

_If you're not comfortable with command line, [here are tutorials using GUI tools.](#tutorials-using-other-tools)_

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/fork.png" alt="fork this repository" />

#### If you don't have git on your machine, [install it](https://help.github.com/articles/set-up-git/).

## Fork this repository

Fork this repository by clicking on the fork button on the top of this page.
This will create a copy of this repository in your account.

## Clone the repository

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/clone.png" alt="clone this repository" />

Now clone the forked repository to your machine. Go to your GitHub account, open the forked repository, click on the code button and then click the _copy to clipboard_ icon.

Open a terminal and run the following git command:

```
git clone "url you just copied"
```

where "url you just copied" (without the quotation marks) is the url to this repository (your fork of this project). See the previous steps to obtain the url.

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/copy-to-clipboard.png" alt="copy URL to clipboard" />

For example:

```
git clone https://github.com/this-is-you/first-contributions.git
```

where `this-is-you` is your GitHub username. Here you're copying the contents of the first-contributions repository on GitHub to your computer.

## Create a branch

Change to the repository directory on your computer (if you are not already there):

```
cd first-contributions
```

Now create a branch using the `git checkout` command:

```
git checkout -b your-new-branch-name
```

For example:

```
git checkout -b add-alonzo-church
```

(The name of the branch does not need to have the word _add_ in it, but it's a reasonable thing to include because the purpose of this branch is to add your name to a list.)

## Make necessary changes and commit those changes

Now open `Contributors.md` file in a text editor, add your name to it. Don't add it at the beginning or end of the file. Put it anywhere in between. Now, save the file.

<img align="right" width="450" src="https://firstcontributions.github.io/assets/Readme/git-status.png" alt="git status" />

If you go to the project directory and execute the command `git status`, you'll see there are changes.

Add those changes to the branch you just created using the `git add` command:

```
git add Contributors.md
```

Now commit those changes using the `git commit` command:

```
git commit -m "Add <your-name> to Contributors list"
```

replacing `<your-name>` with your name.

## Push changes to GitHub

Push your changes using the command `git push`:

```
git push origin <add-your-branch-name>
```

replacing `<add-your-branch-name>` with the name of the branch you created earlier.

## Submit your changes for review

If you go to your repository on GitHub, you'll see a `Compare & pull request` button. Click on that button.

<img style="float: right;" src="https://firstcontributions.github.io/assets/Readme/compare-and-pull.png" alt="create a pull request" />

Now submit the pull request.

<img style="float: right;" src="https://firstcontributions.github.io/assets/Readme/submit-pull-request.png" alt="submit pull request" />

Soon I'll be merging all your changes into the master branch of this project. You will get a notification email once the changes have been merged.
#### Downloading and Installing MongoDB on Windows

1. Download MongoDB Community server from [their site](https://www.mongodb.com/try/download/community).  
   ![image](https://user-images.githubusercontent.com/70942982/145673558-3ed3f457-0c89-43ab-b64e-fed285ecb076.png)

2. Select 'Complete' in their 'choose setup type' section of the installer.  
   ![image](https://user-images.githubusercontent.com/70942982/145673581-8977bf8e-8564-4e81-9e62-5bc7a6064623.png)

3. On the next section, select *Install MongoDB as a service* -> *Run service as Network Service user*  
   ![image](https://user-images.githubusercontent.com/70942982/145673593-a7aff4fd-7420-4aef-9b69-3212ffb0dbc9.png)

4. Install MongoDB compass (GUI Interface for MongoDB)
5. *Install*
6. Create a file named `.env`  in the project directory and write the following line in it -
   ```
   MONGO_URL="mongodb://127.0.0.1:27017"
   ```  
   ![image](https://user-images.githubusercontent.com/70942982/145827232-f1b0c5b8-fd70-4913-add7-f205ec9ff3ef.png)
7. Make sure the `MongoDB Database Server` background process is running (in Task Manager). In case it isn't open `services.msc` from Windows search/Run and right-click and start the process `MongoDB Server`.  
   ![image](https://user-images.githubusercontent.com/70942982/145827387-315e3db6-aba7-4282-bde0-bcf14adffaf6.png)

8. Finally, run `node index.js` in your terminal/Git bash. Visit `localhost:8080`to see the chatApp working.
<br/>

You are required to sign up with an Email ID/Password (can be anything, a valid Email ID is not required so far). Login with the credentials and you'll land at the ChatApp's main page.

---
## Screenshots
![Screenshot from 2021-12-16 18-40-40](https://user-images.githubusercontent.com/33419526/146378487-b89d03d4-b268-4d9c-9869-f38bd46a716b.png)
![Screenshot from 2021-12-16 18-41-19](https://user-images.githubusercontent.com/33419526/146378578-040761f6-c83d-4916-938c-8973eeca57a9.png)
![Screenshot from 2021-12-16 18-42-29](https://user-images.githubusercontent.com/33419526/146378648-d92dab0e-dae8-4b0a-aca6-99e36035d2c3.png)

---
Open the folder in your choice of editor to edit to make changes to the project.
