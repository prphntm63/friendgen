$(document).ready(function() {

    // Initialize Cloud Firestore through Firebase
    firebase.initializeApp({
        apiKey: 'AIzaSyCKgAN9gs6md2rLBCeL5GE5AVB8mN_nO-A',
        // authDomain: '### FIREBASE AUTH DOMAIN ###',
        projectId: 'friendgen'
    });
  
  var db = firebase.firestore();

    $('#addInfo').on('click', writeUserToDb)
    $('#getUser').on('click', getUserFromDb)

    function getInfo() {
        let fb_id = $('#fb_id').val()
        let lat = $('#location_lat').val()
        let lon = $('#location_lon').val()
        let interest = $('#interest').val()

        return {
            "fb_id":fb_id,
            "lat":lat,
            "lon":lon,
            "interest":interest
        }

    }

    function writeUserToDb() {
        let info = getInfo()
        db.collection("users").add({
            id: {
                fb_id : info.fb_id,
                ig_id: 'TEST_IG_USER_2'
            },
            likes: {
                fb: ['dogs', 'cats', 'horses'],
                ig: ['instagram', 'widgets']
            },
            location: {
                lat: 456789,
                lon: 987654
            }
        })
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });

    }

    function getUserFromDb() {
        console.log('Getting User...')
        let info = getInfo();

        db.collection("users").where("id.fb_id", "==", info.fb_id)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

        }

    
    
})