# chatApp

ChatApp is a project that we started to get familiar with Websockets and their implementation with Socket.IO.

The [chatApp](https://chatapp-420.herokuapp.com) is hosted using Heroku at - https://chatapp-420.herokuapp.com

---

#### For guidelines on how to contribute, check out [CONTRIBUTING.md](https://github.com/osBins/chatApp/blob/main/CONTRIBUTING.md) 

## How to set up to contribute to the project
It is recommended that you install and use [Git Bash](https://git-scm.com/downloads) for commands in the following instructions.  
In order to succesfully run the project on your local system, you will need to set up MongoDB on your system too. Instructions are given below.  

#### Downloading the Project

1. **Fork** the GitHub repository.  
   ![image](https://user-images.githubusercontent.com/70942982/143769515-719cdb62-3b85-4d55-8577-ca6a5cdbc4bb.png)

2. Copy and **clone *your fork's*** URL using the `git clone [URL]` command. <br/>
   Copy - <br/>
   ![image](https://user-images.githubusercontent.com/70942982/143769547-9c69be81-e449-4c95-b3ac-2adea2ea7ea1.png) <br/>
   Clone - <br/>
   ![image](https://user-images.githubusercontent.com/70942982/143769592-3bdf78ab-aa1a-4f78-91e7-8e0e728d85c9.png)

3. Change your directory to reach **chatApp** folder using `cd chatApp`

4. Install the required Node.js modules by running `npm install`
   (make sure you have [Node.js](https://nodejs.org/en/download/) installed on your system)  
   ![image](https://user-images.githubusercontent.com/70942982/143769635-a7dc31c9-6681-4032-b181-1045330d149e.png)

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
