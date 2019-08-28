  window.fbAsyncInit = function() {
          FB.init({                                     //initialize and setup the SDK  //FB object with capabilities fo fb API
            appId            : '931960383805197',       //ID of Facebook App
            autoLogAppEvents : true,
            version          : 'v4.0',
          });
         
        };   


        function login() {                                 
            FB.login(ifAuthorized);                  //FB.login returns a response which is then passed in as parameter to ifAuthorize                                        
        } 

        function ifAuthorized(response){             //response is {name: "Pia Soy", id: "10156251899951436"}    
            if (response.authResponse) {            //what is authResponse?
                getUserData(response);              //call getUserData
            } else {
            console.log('User cancelled login or did not fully authorize.');
            }            
        }

        let userData={};
        function getUserData (){
            FB.api(                                 //calls the Graph API
                '/me',                              //user_id
                'GET',                              //method to request data
                {"fields":"id,name,first_name,picture.type(large),likes{name,category}"},
                function(response) {                   
                    userData = response;
                    console.log("userData: ",userData)
                    getEncodedProfilePic(userData.picture.data.url)
                    return userData;
                }
                );
        }

        function getEncodedProfilePic(downloadURL) {
            if (location.hostname === 'localhost') {
                // downloadURL = 'https://cors-anywhere.herokuapp.com/' + downloadURL
            }
            var xmlHTTP = new XMLHttpRequest();
            xmlHTTP.open('GET',downloadURL,true);
            xmlHTTP.responseType = 'arraybuffer';
            xmlHTTP.onload = function(e) {
                var arr = new Uint8Array(this.response)
                var raw = String.fromCharCode.apply(null,arr)
                var b64 = btoa(raw)
                var dataURL='data:image/jpeg;base64,'+b64
                document.getElementById('testImage').src=dataURL;
                console.log(this.response)
                return dataURL // Use this like <img src="${getEncodedProfilePic(downloadURL)"}>
            }
            xmlHTTP.send();
        }