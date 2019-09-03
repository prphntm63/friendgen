$(document).ready(function() {
    
    $('#addLikesToUser').on('click', addLikesToUserModal) // These are the 'submit' buttons on the modal dialogs
    $('#updateUserLikes').on('click', updateUserLikesFromModal)

    setLoadingScreen(false)
})

function clickLogin() {

  document.getElementById("main-div").style.display = "none"
  document.getElementById("cardDiv").style.display = "block"
  document.getElementById("carouselContainer").style.display = "block"

  setLoadingScreen(true)
  
  getData()
  .then(displayData)
}

function setLoadingScreen(status) {
  if (status) {
      $('#loadingScreenDiv').show()
  } else {
    $('#loadingScreenDiv').hide()
  }
  // Create a loading screen so user knows their request was processed
  // Right now it shows 'Jane Doe', lol

  return
}

function setNewUserDialog() {
  // Create some HTML to tell user that they do not have any likes or categories set
  // and should add some or else they will get zero matches
  $('#noLikesModal').modal('show')
  console.log('Looks like you are a new user - add some likes or you\'ll get shitty results!')
}

function getData() {
  let getFbAndLocationData = [getFacebookData(), getLocation()]

  return Promise.all(getFbAndLocationData)
  .then(function([fbData, locationData]) {
    let userData = fbData
    window.USERID = userData.id
    userData.location = {};
    userData.location.lat = locationData.coords.latitude;
    userData.location.lon = locationData.coords.longitude;
    return userData
  })
  .then(checkForNewUser)
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
  setLoadingScreen(false)
}

function checkForNewUser(userData) {
  let newUserPromise = new Promise(function(resolve, reject) {
    DB.getUser(userData)
    .then(user => {
      let userData = user.data()
      let userLikes = userData.likes
      let userCategories = userData.categories

      if (!userLikes || !userCategories) {
        setNewUserDialog()
      } else if (userLikes.length == 0 || userCategories.length ==0 ) {
        setNewUserDialog()
      }

      return user
    })
    .then(user => {
      resolve(userData)
    })
  })

  return newUserPromise
}

function makeUserDiv(userData) {
  let likes = userData.likes 
  let name = userData.name
  let dataURL = userData.dataURL
  let htmlOut = `
        <div class="card mb-3 ; " style="max-width: 540px; margin-top: 30px; border: solid 2px grey">
        <div class="row no-gutters">
          <div class="col-md-4">
            <img id="testImage" src="${dataURL ? dataURL : ''}" class="card-img" alt="..." style="height: 100%">
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
      console.log(user.name, user.score)
      htmlOut += `<div class="carousel-item ${firstMatchedUser ? 'active':''}">
                    <img class="d-block w-25" src="${user.dataURL ? user.dataURL : ''}" alt="Third slide" style="margin: 30px">
                        <div class="carousel-caption d-none d-md-block" >
                                <div style="margin-right: -20px; width: 80%; float: right; height: 130px">
                                        <h2 style="text-align: center"><b>${user.name}</b></h2>
                                        <h4>Score: ${user.score}</h4>
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

function addLikesToUserModal() {
    $('#noLikesModal').modal('hide')

    // We need to add a method here to call DB, get user's existing likes (if any), and pre-populate the dialog. need to define catagories first tho

    $('#addLikesModal').modal('show')
}

function updateUserLikesFromModal() {
    $('#addLikesModal').modal('hide')
    setLoadingScreen(true)
    let userLikesString = $('#userLikesInput').val()
    let userLikes = userLikesString.split(',') 
    // Need to add method here to remove leading/trailing whitespace and illegal chars
    let userCategories = $('#userCategoriesInput').val()

    let userData = {
        id: USERID,
        likes: userLikes,
        categories: userCategories
    }

    DB.updateUserInfo(userData)
    .then(DB.compareUser)
    .then(displayData)
    
}