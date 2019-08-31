
var name;
var likes = []
var profPic;

function clickLogin(){
    // $.ajax({
    //     datatype: 'JSON',
    //     url: 'testuserdata.json',
    //     success: displayData,
    //     error: function(error){
    //         console.log("error not working")
    //     }
    // })
    console.log(dbUserStructure.name)
    displayData(dbUserStructure)
    function displayData(userData, matchData){
        // name = data.name;
        // var likeObject = data.likes.data
        // profPic = data.picture.data.url
        // function mapLikes(likeData){
        //     return likeData.map(makeLikes).join("")
        // }
        // mapLikes(likeObject)

        // function makeLikes(likesArray){
        //     // console.log(likesArray.name)
        //     likes.push(likesArray.name)
        // }
        
        // function getEncodedProfilePic(downloadURL) {
        //     if (location.hostname === 'localhost') {
        //         downloadURL = "https://cors-anywhere.herokuapp.com/" + downloadURL
        //     }
        //     var xmlHTTP = new XMLHttpRequest();
        //     xmlHTTP.open('GET',downloadURL,true);
        //     xmlHTTP.responseType = 'arraybuffer';
        //     xmlHTTP.onload = function(e) {
        //         var arr = new Uint8Array(this.response)
        //         var raw = String.fromCharCode.apply(null,arr)
        //         var b64 = btoa(raw)
        //         var dataURL='data:image/jpeg;base64,'+b64
        //         document.getElementById("testImage").src=dataURL
        //         return dataURL // Use this like <img src="${getEncodedProfilePic(downloadURL)"}>
        //     }
        //     xmlHTTP.send();
        // }

       
        // getEncodedProfilePic(profPic)
        // makeDiv(likes, name)
        makeUserDiv(dbUserStructure.likes, dbUserStructure.name)

        function makeUserDiv(likes, name){
            let htmlOut = `
            <div class="card mb-3 ; " style="max-width: 540px; margin-top: 30px; border: solid 2px grey">
            <div class="row no-gutters">
              <div class="col-md-4">
                <img id="testImage" src="images/noprof.png" class="card-img" alt="..." style="height: 100%">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 id="userName" class="card-title" style="font-weight: bold">${name}</h5>
                  <p id="userLikes" class="card-text">${likes}</p>
                  <div style="display: flex">
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
            `
            let newCard = document.createElement('div')
            newCard.innerHTML = htmlOut
            document.getElementById("cardDiv").innerHTML = ''
            document.getElementById("cardDiv").appendChild(newCard)
        }

        
    
    }
   
}