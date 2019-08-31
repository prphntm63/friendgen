var scoreArray = [];

function clickLogin() {

  document.getElementById("main-div").style.display = "none"
  document.getElementById("cardDiv").style.display = "block"
  document.getElementById("carouselContainer").style.display = "block"

  setLoadingScreen()
  
  getData()
  .then(displayData)
}

function setLoadingScreen() {
  // Create a loading screen so user knows their request was processed
  // Right now it shows 'Jane Doe', lol
  return
}

function getData() {
  let getFbAndLocationData = [getFacebookData(), getLocation()]

  return Promise.all(getFbAndLocationData)
  .then(function([fbData, locationData]) {
    let userData = fbData
    userData.location = {};
    userData.location.lat = locationData.coords.latitude;
    userData.location.lon = locationData.coords.longitude;
    return userData
  })
  .then(DB.updateUserInfo)
  .then(DB.compareUser)
  .catch(err => {
    console.log('Error! could not get data - ', err)
  })

}

function displayData([matchingUsers, userDataDoc]) {
  let userData = userDataDoc.data()

  makeUserDiv(userData)
  var sortedMatchingUsers = matchingUsers.sort((a, b) => b.score - a.score);
  makeMatchDivs(sortedMatchingUsers)
}

function makeUserDiv(userData) {
  let likes = userData.likes 
  let name = userData.name
  let dataURL = userData.dataURL
  let htmlOut = `
        <div class="card mb-3 ; " style="max-width: 540px; margin-top: 30px; border: solid 2px grey">
        <div class="row no-gutters">
          <div class="col-md-4">
            <img id="testImage" src="${dataURL}" class="card-img" alt="..." style="height: 100%">
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

function makeMatchDivs(matchedUsers) {
  let firstMatchedUser = true
  let htmlOut = ``
  // console.log(matchedUsers)

  if (matchedUsers.length) {
    matchedUsers.forEach(user => {
      htmlOut += `<div class="carousel-item ${firstMatchedUser ? 'active':''}">
                    <img class="d-block w-25" src="${user.dataURL}" alt="Third slide" style="margin: 30px">
                        <div class="carousel-caption d-none d-md-block" >
                                <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                        <h2 style="text-align: center"><b>${user.name}</b></h2>
                                        <h4>Sore: ${user.score}</h4>
                                        <p>${user.matchingLikes.join(", ")}</p>
                                    </div>
                        </div>
                  </div>`
      firstMatchedUser = false;
    })
  } else {
    htmlOut += `<div class="carousel-item ${firstMatchedUser ? 'active':''}">
                    <img class="d-block w-25" src="images/noprof.png" alt="Third slide" style="margin: 30px">
                        <div class="carousel-caption d-none d-md-block" >
                                <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                        <h2 style="text-align: center"><b>No Matched Users</b></h2>
                                </div>
                        </div>
                  </div>`
  }

  let newCarousel = document.createElement('div')
  newCarousel.innerHTML = htmlOut
  document.getElementById("carousel-inner").innerHTML = ''
  document.getElementById("carousel-inner").appendChild(newCarousel)

}