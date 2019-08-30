var scoreArray = [];

function clickLogin(){

    document.getElementById("main-div").style.display = "none"
    document.getElementById("cardDiv").style.display = "block"
    document.getElementById("carouselContainer").style.display = "block"
    
    displayData()
    function displayData(){
      
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
                  <p id="userLikes" class="card-text">${likes.join(', ')}</p>
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

        mapMatchedUsers(matchingUsers)
        function mapMatchedUsers(matchedUsers){
            matchedUsers.map(returnMatched).join("")
        }

  
        function returnMatched(users){
           
            scoreArray.push(users.score)
           
           
        }
        console.log(scoreArray)
        var sortedScore = matchingUsers.sort((a, b) => b.score - a.score);
        console.log(sortedScore)

        

        
        
        makeMatchDivs(returnMatched)
        function makeMatchDivs(matchedUsers){
            for(var i = 0; i < sortedScore.length; i++){
                
            }
          
            let htmlOut = `
            <div class="carousel-item active">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h5 style="text-align: center">${matchingUsers[0].name}</h5>
                                <p>${matchingUsers[0].matchingLikes.join(", ")}</p>
                            </div>
                </div>
          </div>
          <div class="carousel-item">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h5 style="text-align: center">User 2</h5>
                                <p>Likes likes likes</p>
                            </div>
                </div>
          </div>
          <div class="carousel-item">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h5 style="text-align: center">User 2</h5>
                                <p>Likes likes likes</p>
                            </div>
                </div>
          </div>
          <div class="carousel-item">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h5 style="text-align: center">User 2</h5>
                                <p>Likes likes likes</p>
                            </div>
                </div>
          </div>
         
            `

           
            let newCarousel = document.createElement('div')
            newCarousel.innerHTML = htmlOut
            document.getElementById("carousel-inner").innerHTML = ''
            document.getElementById("carousel-inner").appendChild(newCarousel)
        }

       

        
    
    }
   
}