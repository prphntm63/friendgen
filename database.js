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

    function getUserFromDb(userData) {
        console.log('Getting User...')

        return db.collection("users").doc(userData.id)
        .get()
        .then(function(doc) {
            console.log("Done!")
            // console.log(doc.data())
            return doc.data()
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
        // .then(calculateScore) //returns matchingUsers
        // .then(returnValue) //returns Promise
    }

    function createMatchingUserObject(userData) {
        let matchingUsers = {
            likes:[],
            categories:[],
            score:undefined
        }
        return [matchingUsers, userData]
    }

    function getUsersWithSharedLikes([matchingUsers, userData]) {
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
                    if (user.id in matchingUsers.likes) {
                        console.log('found user')
                        if (matchingUsers.likes[user.id].likes) {
                            matchingUsers.likes[user.id].likes.push(likeResult.like)
                        } else {
                            matchingUsers.likes[user.id].likes = [likeResult.like]
                        }
                    } else {
                        console.log('constructed user')
                        matchingUsers.likes[user.id] = {}
                        matchingUsers.likes[user.id].likes = [likeResult.like]
                    }
                })
            })
            console.log('oldFunction', matchingUsers)
            return [matchingUsers, userData]
        })
    }

    function getUsersWithSharedCategories([matchingUsers, userData]) {
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
                    if (user.id in matchingUsers.categories) {
                        console.log('found user')
                        if (matchingUsers.categories[user.id].categories) {
                            matchingUsers.categories[user.id].categories.push(categoryResult.category)
                        } else {
                            matchingUsers.categories[user.id].categories = [categoryResult.category]
                        }
                    } else {
                        console.log('constructed user')
                        matchingUsers.categories[user.id] = {}
                        matchingUsers.categories[user.id].categories = [categoryResult.category]
                    }
                })
            })
            console.log('newFunction', matchingUsers)
            return matchingUsers
        })
    }


    

    // function compareUserInDb(userData) {
    //     let maxTimeout = 100000000; //Seconds for time fix
    //     console.log('Matching Users ...')

    //     return db.collection("users").doc(userData.id)
    //     .get()
    //     .then(doc => {
    //         let userDocument = doc.data();
    //         return userDocument
    //     })
    //     .then(userDocument => {
    //         console.log("1")
    //         var matchingUsers = {};
    //         var userPromises = [];
    //         userDocument.likes.forEach(like => {
    //             db.collection("users").where("likes","array-contains",like).get()
    //             .then(querySnapshot => {
    //                 querySnapshot.forEach(value => {
    //                     if (Math.abs(userDocument.lastFix.seconds - value.data().lastFix.seconds) <= maxTimeout) {
    //                         if (matchingUsers[value.id] && value.id != userData.id) {
    //                             if (!matchingUsers[value.id].likes) {
    //                                 matchingUsers[value.id].likes = [like]
    //                             } else {
    //                                 matchingUsers[value.id].likes.push(like) 
    //                             } 
    //                         } else if (value.id != userData.id) {
    //                             matchingUsers[value.id] = {}
    //                             matchingUsers[value.id].likes = [like]
    //                         }
    //                     }
    //                 })
    //                 console.log("2")
    //                 return
    //             })
    //         })
    //         console.log("3");
    //         return [userDocument, matchingUsers]
    //     })
    //     .then(function([userDocument, matchingUsers]) {
    //         console.log("4");
    //         userDocument.categories.forEach(category => {
    //             db.collection("users").where("categories","array-contains",category).get()
    //             .then(querySnapshot => {
    //                 querySnapshot.forEach(value => {
    //                     if (Math.abs(userDocument.lastFix.seconds - value.data().lastFix.seconds) <= maxTimeout) {
    //                         if (matchingUsers[value.id] && value.id != userData.id) {
    //                             if (!matchingUsers[value.id].categories) {
    //                                 matchingUsers[value.id].categories = [category]
    //                             } else {
    //                                 matchingUsers[value.id].categories.push(category) 
    //                             }
    //                         } else if (value.id != userData.id) {
    //                             matchingUsers[value.id] = {}
    //                             matchingUsers[value.id].categories = [category]
    //                         }
    //                     }
    //                 })
    //                 return 
    //             })
    //         })
    //         return 
    //     })
    //     .then(matchingUsers => {
    //         console.log("matchingUsers", matchingUsers)
    //         for (var key in matchingUsers) {

    //             console.log("key", key);
    //             // let numLikes = matchingUsers[key].likes.length
    //             // let numCategories = matchingUsers[key].categories.length
    //             // let score = 5*numLikes + 3*numCategories
    //             // matchingUsers[key].score = score
    //         }
    //         return matchingUsers
    //     })
    //     .then(matchingUsers => {
    //         console.log('Done!')
    //         console.log(matchingUsers)
    //         return matchingUsers
    //     })
    //     .catch(function(error) {
    //         console.log("Error matching users: ", error);
    //     })

    // }

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