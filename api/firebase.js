var firebase = require('firebase');
var bcrypt = require('bcryptjs');

var firebaseConfig = {
    apiKey: "AIzaSyDM8JsZqN_257ufb2JzA41g7_-anyov1jw",
    authDomain: "team8-attendance.firebaseapp.com",
    databaseURL: "https://team8-attendance.firebaseio.com",
    projectId: "team8-attendance-web",
    storageBucket: "team8-attendance.appspot.com",
    messagingSenderId: "71400441080",
    appId: "1:71400441080:web:f3c7fd4923cb4982cc670d",
    measurementId: "G-9GK5P6G0VN"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function createUser(userId, first, last, email, subteam, password) {
    return new Promise((resolve, reject) => {
        password = hashPassword(password).then((result) => {
            database.ref('users/' + userId).once('value').then(function (snapshot) {
                var user = snapshot.val();
                if (user == null) {
                    database.ref('users/' + userId).set({
                        first: first,
                        last: last,
                        email: email,
                        subteam: subteam,
                        password: result
                    });
                    resolve(true);
                }
                else {
                    reject(false);
                }
            })
        });
    });
}

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                resolve(hash);
            });
        });
    });
}

function authenticateUser(userId, password) {
    return new Promise((resolve, reject) => {
        database.ref('users/' + userId).once('value').then(function (snapshot) {
            var userData = snapshot.val();
            if (userData == null) {
                resolve("User does not exist.")
            } else {
                bcrypt.compare(password, userData.password, function (err, res) {
                    if (res) {
                        resolve(userData);
                    } else {
                        resolve("Incorrect password.");
                    }
                });
            }
        });
    });
}

function logTime(userId, hours, timein, timeout) {
    firebase.database().ref('year/2019/off-season/' + userId + '/logs/10-17-2019/').set({
        hours: hours,
        timein: timein,
        timeout: timeout
    });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        firebase.database().ref('year/2019/off-season/').once('value').then(function (logs) {
            firebase.database().ref('users/').once('value').then(function (users) {
                logs = logs.val();
                users = users.val();
                const keys = Object.keys(users)
                for (const key of keys) {
                    if (logs[key] != undefined) {
                        users[key]["total-hours"] = logs[key]["total-hours"];
                    }
                }
                resolve(users);
            });
        });
    });
}

function getUser(userId) {
    return new Promise((resolve, reject) => {
        firebase.database().ref('year/2019/off-season/' + userId).once('value').then(function (logs) {
            firebase.database().ref('/users/' + userId).once('value').then(function (users) {
                logs = logs.val();
                users = users.val();
                const userData = Object.assign(logs, users);
                resolve(userData);
            });
        });
    });
}

function deleteUser(userId) {
    firebase.database().ref('/users/').child(userId).remove();
}

module.exports = {
    createUser: createUser,
    authenticateUser: authenticateUser,
    logTime: logTime,
    getUsers: getUsers,
    getUser: getUser,
    deleteUser: deleteUser
};