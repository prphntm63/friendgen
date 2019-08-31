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
            name : userData.name,
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

    function compareUserInDb(userData) {
        let maxTimeout = 100000000; //Seconds for time fix
        console.log('Matching Users ...')

        getUserFromDb(userData) //returns user object
        .then(createMatchingUserObject) //returns empty matchingUsers + array of Like Users        
        .then(getUsersWithSharedLikes) //returns matchingUsers
        .then(getUsersWithSharedCategories) //returns matchingUsers
        .then(calculateScore) //returns matchingUsers
        .then(returnMatchingUser) //returns Promise
    }

    function createMatchingUserObject(userDataDoc) {
        let matchingUsers = []
        return [matchingUsers, userDataDoc]
    }

    function getUsersWithSharedLikes([matchingUsers, userDataDoc]) {
        let userData = userDataDoc.data()
        let likes = userData.likes
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
                                'name':user.name,
                                'matchingLikes':[likeResult.like]
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
                                'name':user.name,
                                'matchingCategories':[categoryResult.category]
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

    function calculateScore([matchingUsers, userDataDoc]) {
        matchingUsers.forEach(user => {
            let numberSharedLikes = user.matchingLikes.length
            let numberSharedCategories = user.matchingCategories.length
            let score = (2 * numberSharedLikes) + (5 * numberSharedCategories)
            user.score = score
        })
        return [matchingUsers, userDataDoc]
    }

    function returnMatchingUser([matchingUsers, userDataDoc]) {
        console.log('Done!')
        console.log(matchingUsers)
        return matchingUsers
    }


    window.DB = window.DB || {}
    window.DB.updateUserInfo = updateUserInfo
    window.DB.updateUserStatus = updateUserStatus
    window.DB.getUser = getUserFromDb
    window.DB.compareUser = compareUserInDb

    
})();
