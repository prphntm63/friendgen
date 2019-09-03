 //initialize and setup the SDK    
 window.fbAsyncInit = function() {
    FB.init({                                      
      appId            : '931960383805197',      
      autoLogAppEvents : true,
      version          : 'v4.0',
    });
   
}; 


function getFacebookData() {
    
    var promise = new Promise(function(resolve, reject) {
    let dbUserStructure = {};
    let userData={};


        //authenticate user                          
        FB.login(ifAuthorized);                                                        
    
        //handle user response
        function ifAuthorized(response){             //response is {name: "Pia Soy", id: "10156251899951436"}    
            if (response.authResponse) {           
                getUserData(response);              
            } else {
                reject('User cancelled login or did not fully authorize.');
            }            
        }
    
        //call the Graph API
        function getUserData () {
            FB.api(                                
                '/me',                             
                'GET',                             
                {"fields":"id,name,first_name,picture.type(large),likes{name,category}"},
                handleUserData
            );
        }

        //handle FB user data
        function handleUserData(response) {
            userData = response;
            // console.log(userData)
            getEncodedProfilePic(userData.picture.data.url)
        }

        //handle FB profile pic data
        function getEncodedProfilePic(downloadURL) {
            var imageURL = "test"
            if (location.hostname === 'localhost') {
                downloadURL = 'https://cors-anywhere.herokuapp.com/' + downloadURL
            }
            var xmlHTTP = new XMLHttpRequest();
            xmlHTTP.open('GET',downloadURL,true)
            xmlHTTP.responseType = 'arraybuffer';
            xmlHTTP.onload = function(e) {
                var arr = new Uint8Array(this.response)
                var raw = String.fromCharCode.apply(null,arr)
                var b64 = btoa(raw)
                var dataURL='data:image/jpeg;base64,'+b64
                // document.getElementById('testImage').src=dataURL;
    
                createDBUserStructure(dataURL);

            }
            xmlHTTP.send();
        
        }

        //create database structure from FB user data
        function createDBUserStructure (dataURL) {
            let likeNames =[];
            let likeCategories =[];

            if (userData.likes) {
                //loop through userData.likes.data array, push every fb page liked
                userData.likes.data.forEach(function(likeItem){likeNames.push(likeItem.name)});
                //loop through userData.likes.data array, push every category of fb page liked
                userData.likes.data.forEach(function(likeItem){likeCategories.push(likeItem.category)});
                //remove duplicate categories
            }

            let filteredLikeCategories = likeCategories.filter(function (item, index){
                return likeCategories.indexOf(item) === index;            
            })

            //create structure object
            dbUserStructure["id"] = userData.id;
            dbUserStructure["name"] = userData.first_name;
            if (likeNames.length) {
                dbUserStructure["likes"] = likeNames
            }
            if (filteredLikeCategories.length) {
                dbUserStructure["categories"] = filteredLikeCategories;
            }      
            dbUserStructure["dataURL"] = dataURL
            
            resolve(dbUserStructure)

        }


    });

    return promise

    // //emulate next function
    // promise.then(function(dbValue) {
    //     console.log("dbValue", dbValue);
        
    // });
}

