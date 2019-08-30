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
                  
                  <h5 id="userName" class="card-title" style="font-weight: bold">User: ${name}</h5>
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

      
      
        var sortedScore = matchingUsers.sort((a, b) => b.score - a.score);
        

        

        
        
        makeMatchDivs(sortedScore)
        function makeMatchDivs(matchedUsers){
           console.log(matchedUsers)
            
          
            let htmlOut = `
            <div class="carousel-item active">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h2 style="text-align: center"><b>${matchedUsers[0].name}</b></h2>
                                <h4>Sore: ${matchedUsers[0].score}</h4>
                                <p>${matchedUsers[0].matchingLikes.join(", ")}</p>
                            </div>
                </div>
          </div>
          <div class="carousel-item">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h2 style="text-align: center"><b>${matchedUsers[1].name}</b></h2>
                                <h4>Score: ${matchedUsers[1].score}</h4>
                                <p>${matchedUsers[1].matchingLikes.join(", ")}</p>
                            </div>
                </div>
          </div>
          <div class="carousel-item">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h2 style="text-align: center"><b>${matchedUsers[2].name}</b></h2>
                                <h4>Score: ${matchedUsers[2].score}</h4>
                                <p>${matchedUsers[2].matchingLikes.join(", ")}</p>
                            </div>
                </div>
          </div>
          <div class="carousel-item">
            <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                <div class="carousel-caption d-none d-md-block" >
                        <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                <h2 style="text-align: center"><b>${matchedUsers[3].name}</b></h2>
                                <h4>Score: ${matchedUsers[3].score}</h4>
                                <p>${matchedUsers[3].matchingLikes.join(", ")}</p>
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