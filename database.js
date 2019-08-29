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

        return db.collection("users").doc(userData.id)
        .set({
            // likes: firebase.firestore.FieldValue.arrayUnion(userData.interest),
            likes : userData.likes,
            categories : userData.categories,
            location: {
                lat: userData.lat,
                lon: userData.lon
            },
            lastFix : firebase.firestore.Timestamp.now(),
            dataURL: userData.dataURL
        }, {merge:true})
        .then(querySnapshot => {
            console.log('Done!')
        })
        .catch(errorSnapshot => {
            console.log('Error creating or updating user! - ')
            console.log(errorSnapshot)
        })
    }

    function updateUserStatus(userData) {
        console.log('Updating User...')

        return db.collection("users").doc(userData.id)
        .update({
            location: {
                lat: userData.lat,
                lon: userData.lon
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

    function getUserFromDb(userData, userDataFunction) {
        console.log('Getting User...')

        return db.collection("users").doc(userData.id)
        .get()
        .then(function(doc) {
            console.log("Done!")
            console.log(doc.data())
            return doc.data()
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
    }

    function compareUserInDb(userData) {
        let maxTimeout = 100000000; //Seconds for time fix
        console.log('Matching Users ...')

        return db.collection("users").doc(userData.id)
        .get()
        .then(doc => {
            let userDocument = doc.data();
            return userDocument
        })
        .then(userDocument => {
            var matchingUsers = {}
            userDocument.likes.forEach(like => {
                db.collection("users").where("likes","array-contains",like).get()
                .then(querySnapshot => {
                    querySnapshot.forEach(value => {
                        if (Math.abs(userDocument.lastFix.seconds - value.data().lastFix.seconds) <= maxTimeout) {
                            if (matchingUsers[value.id] && value.id != userData.id) {
                                if (!matchingUsers[value.id].likes) {
                                    matchingUsers[value.id].likes = [like]
                                } else {
                                    matchingUsers[value.id].likes.push(like) 
                                } 
                            } else if (value.id != userData.id) {
                                matchingUsers[value.id] = {}
                                matchingUsers[value.id].likes = [like]
                            }
                        }
                    })
                    return
                })
                
            })
            return [userDocument, matchingUsers]
        })
        .then(function([userDocument, matchingUsers]) {
            userDocument.categories.forEach(category => {
                db.collection("users").where("categories","array-contains",category).get()
                .then(querySnapshot => {
                    querySnapshot.forEach(value => {
                        if (Math.abs(userDocument.lastFix.seconds - value.data().lastFix.seconds) <= maxTimeout) {
                            if (matchingUsers[value.id] && value.id != userData.id) {
                                if (!matchingUsers[value.id].categories) {
                                    matchingUsers[value.id].categories = [category]
                                } else {
                                    matchingUsers[value.id].categories.push(category) 
                                }
                            } else if (value.id != userData.id) {
                                matchingUsers[value.id] = {}
                                matchingUsers[value.id].categories = [category]
                            }
                        }
                    })
                    return
                })
            })
            return matchingUsers
        })
        .then(matchingUsers => {
            console.log('Done!')
            console.log(matchingUsers)
            return matchingUsers
        })
        .catch(function(error) {
            console.log("Error matching users: ", error);
        })

    }

    window.DB = window.DB || {}
    window.DB.updateUserInfo = updateUserInfo
    window.DB.updateUserStatus = updateUserStatus
    window.DB.getUser = getUserFromDb
    window.DB.compareUser = compareUserInDb

    /*
    List of functions - 
        * getUserFromDb(userObject) - gets FB_ID, FB_Likes, Location, LoginTime
            * args: userObject - {*"id":Facebook ID, "lat":latitude, "lon":longitude, "interest":array of interests}

        * updateUserInDb(userObject) - checks to see if user with FB_ID exists
            * If yes, 
                * fetches likes 
                * fetches location
                * fetches last Login
                * updates DB entry
            * If no, 
                * fetches FB_user
                * fetches likes
                * fetches location
                * fetches last_login
                * creates DB entry
            * args: {*"id":Facebook ID, "lat":latitude, "lon":longitude, "interest":array of interests}
        
        * compareUserInDb(userObject) - returns a filtered list of all users with at least one common like
            * args: {*"id":Facebook ID, "lat":latitude, "lon":longitude, "interest":array of interests}

    */

    
    
})();