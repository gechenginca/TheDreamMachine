# StudyTable API Documentation

## User API

### signup
- description: sign up a new user
- request: `POST /signup/`
- response: 200 (ok)
- response: 500 (internal server error)
- response: 409 (username already exist)
- response: 400 (username or password is missing)
```
- $     curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice","yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -c cookie.txt localhost:3000/signup/

```

### signin
- description: user sign in them only account
- request: `POST /signin/`
- response: 200 (ok)
- response: 500 (internal server error)
- response: 401 (Unauthorized)
- response: 400 (username or password is missing)
```
- $ curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
```

### signout
- description: user sign out them account
- request: `GET /signout/`
- response: 200 (ok)
```
- $ curl -b cookie.txt -c cookie.txt localhost:3000/signout/
```

### get all user
- description: get all usernames
- request: `GET /api/users/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
```
- $ curl -b cookie.txt localhost:3000/api/users/
```

### assign user
- description: get a user which it need
- request: `GET /api/users/:username`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
- respones: 404 (username do not exist)
```
- $ curl -b cookie.txt localhost:3000/api/users/alice
```

### update user
- description: change account password by user
- request: `PATCH /signup/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
- response: 404 (username do not exist)
```
- $ curl -H "Content-Type: application/json" -X PATCH -d '{"yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -b cookie.txt localhost:3000/api/users/alice
```


## TABLE API

### Add a study table
- description: Add a new study table
- request: `POST /api/studyTables/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
- response: 409 (tablename already exist)
```
- $ curl -H "Content-Type: application/json" -X POST -d '{"studyTableName":"C09","owner":"alice", "course":"C09","location":"uoft","type":"discussion","priOrPub":"public","description":"c09 awesome","members":["alice"],"meetingTimes":["Friday"],"meetingTopics":["c09 project"]}' -b cookie.txt localhost:3000/api/studyTables/
```

### get tables
- description: get all study tables
- request: `GET /api/studyTables/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
```
- $ curl -b cookie.txt localhost:3000/api/studyTables/
```

### get a table
- description: get a study table with table name
- request: `GET /api/studyTables/:studyTableName/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
- response: 404 (table name not exist)
```
- $ curl -b cookie.txt localhost:3000/api/studyTables/C09
```

### update table
- description: update the information of study table
- request: `PATCH /api/studyTables/:studyTableName/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
- respones: 404 (table name not exist)
```
- $ curl -H "Content-Type: application/json" -X PATCH -d '{"course":"C09","location":"uoft","type":"discussion","priOrPub":"public","description":"c09 awesome","members":["alice"],"meetingTimes":["Friday 1-3pm"],"meetingTopics":["c09 project"]}' -b cookie.txt localhost:3000/api/studyTables/C09
```

### delete table
- description: delete a study table by owner
- request: `DELETE /api/studyTables/:studyTableName/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
- response: 404 (table not exist)
```
- $ curl -b cookie.txt -X DELETE localhost:3000/api/studyTables/C09
```

## CANVAS API

### get canvas' data
- description: get the canvas with tableId
- request: `GET /api/canvas/:tableId/`
- response: 200 (ok)
- response: 401 (Unauthorized)
```
- $ curl -b cookie.txt localhost:3000/api/canvas/data
```

### get a canvas
- description: get the canvas with tableId
- request: `GET /api/canvas/:tableId/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
- response: 404 (table not exist)
```
- $ curl -b cookie.txt localhost:3000/api/canvas/C09
```

### update canvas
- description: update the change of canvas
- request: `PATCH /api/saveCanvas/`
- response: 200 (ok)
- response: 500 (Internal server error)
- response: 401 (Unauthorized)
```
- $ curl -b cookie.txt localhost:3000/api/saveCanvas
```