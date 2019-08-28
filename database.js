$(document).ready(function() {
    $('#addInfo').on('click', clickToUpdateUser)
    $('#getUser').on('click', clickToGetUser)
    $('#compareUser').on('click', clickToCompareUser)
    function clickToUpdateUser() {
        let userData = getFormInfo();
        updateUserInDb(userData);
    }

    function clickToGetUser() {
        let userData = getFormInfo();
        getUserFromDb(userData);
    }

    function clickToCompareUser() {
        let userData = getFormInfo();
        compareUserInDb(userData);
    }

    // Initialize Cloud Firestore through Firebase
    firebase.initializeApp({
        apiKey: 'AIzaSyCKgAN9gs6md2rLBCeL5GE5AVB8mN_nO-A',
        // authDomain: '### FIREBASE AUTH DOMAIN ###',
        projectId: 'friendgen'
    });
  
    var db = firebase.firestore();

    function getFormInfo() {
        let fb_id = $('#fb_id').val()
        let lat = $('#location_lat').val()
        let lon = $('#location_lon').val()
        let interest = $('#interest').val()

        return {
            "id":fb_id,
            "lat":lat,
            "lon":lon,
            "interest": interest
        }

    }

    function getEncodedProfilePic(downloadURL) {
        if (location.hostname === 'localhost') {
            downloadURL = "https://cors-anywhere.herokuapp.com/" + downloadURL
        }
        
        var xmlHTTP = new XMLHttpRequest();
        xmlHTTP.open('POST',downloadURL,true);
        xmlHTTP.responseType = 'arraybuffer';
        xmlHTTP.onload = function(e) {
            var arr = new Uint8Array(this.response)
            var raw = String.fromCharCode.apply(null,arr)
            var b64 = btoa(raw)
            var dataURL='data:image/jpeg;base64,'+b64

            // $("#testImage").attr('src', dataURL)

            return dataURL // Use this like `<img src="${getEncodedProfilePic(downloadURL)"}>`
        }
        xmlHTTP.send();
    
    }

    function updateUserInDb(userData) {
        // userData is an array containing {"id":Facebook ID, "lat":latitude, "lon":longitude, "interest":array of interests, "profilePic":64-bit encoded image data}

        console.log('Updating User...')

        db.collection("users").doc(userData.id)
        .set({
            likes: firebase.firestore.FieldValue.arrayUnion(userData.interest),
            // likes : userData.interest,
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
            console.log('Error! - ')
            console.log(errorSnapshot)
        })

    }

    function getUserFromDb(userData, userDataFunction) {
        console.log('Getting User...')

        db.collection("users").doc(userData.id)
        .get()
        .then(function(doc) {
            console.log("Done!")
            console.log(doc.data())
            userDataFunction(doc.data())
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

    }

    function compareUserInDb(userData, userDataFunction) {
        let maxTimeout = 100000000; //Seconds for time fix

        console.log('Matching Users ...')

        db.collection("users").doc(userData.id)
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
                                matchingUsers[value.id].push(like) 
                            } else if (value.id != userData.id) {
                                matchingUsers[value.id] = [like]
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
            userDataFunction(matchingUsers)
        })
    }

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

    
    
})