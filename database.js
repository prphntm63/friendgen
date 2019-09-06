;(function() {

    // Initialize Cloud Firestore through Firebase
    firebase.initializeApp({
        apiKey: 'AIzaSyCKgAN9gs6md2rLBCeL5GE5AVB8mN_nO-A',
        // authDomain: '### FIREBASE AUTH DOMAIN ###',
        projectId: 'friendgen'
    });
  
    var db = firebase.firestore();

    function updateUserInfo(userData) {

        // userData is an array containing {"id":Facebook ID, "lat":latitude, "lon":longitude, "interest":array of interests, "profilePic":64-bit encoded image data}

        console.log('Updating User...')

        userData.lastFix = firebase.firestore.Timestamp.now()

        return db.collection("users").doc(userData.id)
        // .set({
        //     // likes: firebase.firestore.FieldValue.arrayUnion(userData.interest),
        //     name : userData.name,
        //     likes : userData.likes,
        //     categories : userData.categories,
        //     location: userData.location,
        //     lastFix : firebase.firestore.Timestamp.now(),
        //     dataURL: userData.dataURL
        // }, {merge:true})
        .set(userData, {merge:true})
        .then(querySnapshot => {
            console.log('Done! - updated '+ userData.id)
            return userData
        })
        .catch(errorSnapshot => {
            console.log('Error creating or updating user! - ')
            console.log(errorSnapshot)
        })
    }

    
    function updateUserStatus(userData) {
        console.log('Updating User...')
        console.log('userData', userData)

        return db.collection("users").doc(userData.id)
        .update({
            location: {
                lat: userData.location.lat,
                lon: userData.location.lon
            },
            lastFix : firebase.firestore.Timestamp.now()
        })
        .then(data => {
            console.log("Done!")
        })
        .catch(errorSnapshot => {
            console.log('Error updating user status! - ')
            console.log(errorSnapshot)
        })
    }

    

    function getUserFromDb(userData) {
        console.log('Getting User...')

        return db.collection("users").doc(userData.id)
        .get()
        .then(function(doc) {
            console.log("Done!")
            // console.log(doc.data())
            return doc
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
    }

    function deleteUserInDb(userData) {
        return db.collection("users").doc(userData.id)
        .delete()
        .catch(err => {
            console.log('Error deleting document: ', error)
        })
    }

    function compareUserInDb(userData) {
        console.log('Matching Users ...')

        return getUserFromDb(userData) //returns user object
        .then(createMatchingUserObject) //returns empty matchingUsers + array of Like Users        
        .then(getUsersWithSharedLikes) //returns matchingUsers
        .then(getUsersWithSharedCategories) //returns matchingUsers
        .then(filterLocationLogin)
        .then(calculateScore) //returns matchingUsers
        .then(returnMatchingUser) //returns Promise
    }

    function createMatchingUserObject(userDataDoc) {
        let matchingUsers = []
        return [matchingUsers, userDataDoc]
    }

    function getUsersWithSharedLikes([matchingUsers, userDataDoc]) {
        let userData = userDataDoc.data()
        // let likes = ['cows', 'guitars']
        let likes = userData.likes
        if (!userData.likes) {return [matchingUsers, userDataDoc]}

        let userLikePromises = []
        likes.forEach(like => {
            userLikePromises.push(
                db.collection("users")
                .where("likes","array-contains",like)
                .get()
                .then(querySnapshot => {
                    let queryUsers = [];
                    querySnapshot.forEach(user => {
                            queryUsers.push( {
                                "id":user.id,
                                "data":user.data()
                            });
                        })
                    
                    return {
                        "like":like,
                        "users":queryUsers
                    }
                })
            )
        })

        return Promise.all(userLikePromises)
        .then(values => {
            values.forEach(likeResult => {
                likeResult.users.forEach(user => {
                    if (user.id != userDataDoc.id) {
                        let userObject = matchingUsers.find(matchingUserId => {
                            return matchingUserId.id === user.id
                        })
                        if (userObject == undefined) {
                            userObject = {
                                'id':user.id,
                                'name':user.data.name,
                                'location':user.data.location,
                                'lastfix':user.data.lastFix,
                                'matchingLikes':[likeResult.like],
                                'dataURL':user.data.dataURL
                            }
                            matchingUsers.push(userObject)
                        } else {
                            if (userObject.matchingLikes == undefined) {
                                userObject.matchingLikes = [likeResult.like]
                            } else {
                                userObject.matchingLikes.push(likeResult.like)
                            }
                        }
                    }
                })
            })
            return [matchingUsers, userDataDoc]
        })
    }

    function getUsersWithSharedCategories([matchingUsers, userDataDoc]) {
        let userData = userDataDoc.data()
        let categories = userData.categories
        // let categories = ['guitars']
        if (!userData.categories) {return [matchingUsers, userDataDoc]}
        let userCategoryPromises = []
        categories.forEach(category => {
            userCategoryPromises.push(
                db.collection("users")
                .where("categories","array-contains",category)
                .get()
                .then(querySnapshot => {
                    let queryUsers = [];
                    querySnapshot.forEach(user => {
                            queryUsers.push( {
                                "id":user.id,
                                "data":user.data()
                            });
                        })
                    
                    return {
                        "category":category,
                        "users":queryUsers
                    }
                })
            )
        })

        return Promise.all(userCategoryPromises)
        .then(values => {
            values.forEach(categoryResult => {
                categoryResult.users.forEach(user => {
                    if (user.id != userDataDoc.id) {
                        let userObject = matchingUsers.find(matchingUserId => {
                            return matchingUserId.id === user.id
                        })
                        if (userObject == undefined) {
                            userObject = {
                                'id':user.id,
                                'name':user.data.name,
                                'location':user.data.location,
                                'lastfix':user.data.lastFix,
                                'matchingCategories':[categoryResult.category],
                                'dataURL':user.data.dataURL
                            }
                            matchingUsers.push(userObject)
                        } else {
                            if (userObject.matchingCategories == undefined) {
                                userObject.matchingCategories = [categoryResult.category]
                            } else {
                                userObject.matchingCategories.push(categoryResult.category)
                            }
                        }
                    }
                })
            })
            return [matchingUsers, userDataDoc]
        })
    }

    function filterLocationLogin([matchingUsers, userDataDoc]) {
        let maxTimeout = 1000000000 //seconds from last login
        let maxDistance = 1000000000 //distance in meters

        function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
            var R = 6378.137; // Radius of earth in KM
            var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
            var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            return d * 1000; // meters
        }

        let userData = userDataDoc.data()
        let newMatchingUsers = []
        
        matchingUsers.forEach(user => {
            let time = 1000000;
            if (user.lastfix) {
                time = userData.lastFix.seconds - user.lastfix.seconds
            }
            let distance = measure(user.location.lat, user.location.lon, userData.location.lat, userData.location.lon)
            if (distance <= maxDistance || time <= maxTimeout) {
                newMatchingUsers.push(user)
            }
        })

        return [newMatchingUsers, userDataDoc]
    }

    function calculateScore([matchingUsers, userDataDoc]) {
        matchingUsers.forEach(user => {
            let numberSharedLikes = user.matchingLikes ? user.matchingLikes.length : 0
            let numberSharedCategories = user.matchingCategories ? user.matchingCategories.length : 0
            let score = (2 * numberSharedLikes) + (5 * numberSharedCategories)
            user.score = score
        })
        return [matchingUsers, userDataDoc]
    }

    function returnMatchingUser([matchingUsers, userDataDoc]) {
        console.log('Done!')
        // console.log([matchingUsers, userDataDoc])
        // We only want the first 6 matching users
        matchingUsers = matchingUsers.sort(function(a,b) {return b.score - a.score})
        if (matchingUsers.length > 6) {
            matchingUsers = matchingUsers.slice(5)
        }
        return [matchingUsers, userDataDoc]
    }

    function sendUserMessage(userData, targetUser, message) {
        // Both userData and targeteUser are User objects
        console.log(userData.id, message.text, message.subject)

        return db.collection("users").doc(targetUser.id)
        .set({
            messages: firebase.firestore.FieldValue.arrayUnion({
                "messageId":generateUUID(),
                "subject":message.subject,
                "message":message.text,
                "sender":userData.id,
                "read":false
            }),
        }, {merge:true})
        .then(querySnapshot => {
            console.log('Done! - sent message to'+ targetUser.id)
            return userData
        })
        .catch(errorSnapshot => {
            console.log('Error sending message - ')
            console.log(errorSnapshot)
        })
    }

    function getUserMessages(userData) {
        return getUserFromDb(userData)
        .then(userDocument => {
            let userData = userDocument.data();
            return userData.messages
        })
    }

    function generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }


    function markMessageReadInDb(messageId) {
        return getUserMessages({"id":USERID})
        .then(messages => {
            for (let idx=0; idx<messages.length; idx++) {
                if (messages[idx].messageId == messageId) {
                    messages[idx].unread = false;
                    return messages
                }
            }
        })
        .then(messages => {
            return db.collection("users").doc(USERID)
            .set({
                "messages" : messages
            }, {merge:true})
            .then(querySnapshot => {
                console.log('Marked message read')
            })
            .catch(errorSnapshot => {
                console.log('Error marking message read - ')
                console.log(errorSnapshot)
            })
        })
    }

    function deleteMessageFromDb(messageId) {
        return getUserMessages({"id":USERID})
        .then(messages => {
            for (let idx=0; idx<messages.length; idx++) {
                if (messages[idx].messageId == messageId) {
                    messages.splice(idx,1);
                    return messages
                }
            }
        })
        .then(messages => {
            return db.collection("users").doc(USERID)
            .set({
                "messages" : messages
            }, {merge:true})
            .then(querySnapshot => {
                console.log('Deleted Message')
            })
            .catch(errorSnapshot => {
                console.log('Error deleting message - ')
                console.log(errorSnapshot)
            })
        })
    }

    function authenticateDb(userData) {
        let dbAuthPromise = new Promise(function(resolve, reject) {
          return firebase.auth().signInAnonymously()
          .then(function() {
                resolve(userData)
            })
          .catch(error => {
            console.log(error)
          })
        })
      
        return dbAuthPromise
    }

    function deauthenticateDb() {
        let dbDeauthPromise = new Promise(function(resolve, reject) {
            return firebase.auth().signOut()
            .then(resolve())
            .catch(error => {
                console.log(error)
            })
        })

        return dbDeauthPromise
    }


    window.DB = window.DB || {}
    window.DB.updateUserInfo = updateUserInfo
    window.DB.updateUserStatus = updateUserStatus
    window.DB.getUser = getUserFromDb
    window.DB.compareUser = compareUserInDb
    window.DB.sendMessage = sendUserMessage
    window.DB.getMessages = getUserMessages
    window.DB.markMessageRead = markMessageReadInDb
    window.DB.deleteMessage = deleteMessageFromDb
    window.DB.authenticate = authenticateDb
    window.DB.deauth = deauthenticateDb


    
})();