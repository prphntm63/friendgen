$(document).ready(function() {
  
    $('#addLikesToUser').on('click', addLikesToUserModal) // These are the 'submit' buttons on the modal dialogs
    $('#updateUserLikes').on('click', updateUserLikesFromModal)

    $('#logout').hide() //Hide the user logged in buttons by default
    $('#userBadge').hide()
    $('#editProfile').hide()

    // Navbar 'edit profile' and 'logout' options
    $('#editProfile').on('click', addLikesToUserModal)
    $('#logout').on('click', logout)
    $('#login').on('click', clickLogin)
    document.getElementById('logout').style.visibility='hidden';

    // This snippet should allow toggle clicking instead of control click to select multiple categories
    $("select[multiple] option").mousedown(function(){
      var $self = $(this);
   
      if ($self.prop("selected"))
             $self.prop("selected", false);
      else
          $self.prop("selected", true);
   
      return false;
   });

    setLoadingScreen(false)
})

function clickLogin() {
  $('#main-div').hide() //Hide the main login button
  
  setLoadingScreen(true) //set loading
  
  getData() //Get user and matching users from database
  .then(displayData) //render data
}

function logout() {
  //This function should log out of facebook session and reload page

  FB.logout (function(response){
    $('#login').show()
    $('#logout').hide()
    $('#background-wrap').show()
    $('#main-div').show()
    $('#matchCardParentContainer').html('')
    $('#userBadge').hide()
    $('#editProfile').hide()
    console.log("you are now logged out")
  });
}

function setLoadingScreen(status) { //This function overlays (or removes) a full screen 'loading' div
  if (status) {
    $('#loadingScreenDiv').show()
  } else {
    $('#loadingScreenDiv').hide()
  }
  return
}

function setNewUserDialog() {
  // Create some HTML to tell user that they do not have any likes or categories set
  // and should add some or else they will get zero matches
  $('#noLikesModal').modal('show')
}

function getData() {
  let getFbAndLocationData = [getFacebookData(), getLocation()]

  return Promise.all(getFbAndLocationData) //wait for both FB and location data
  .then(function([fbData, locationData]) { //build it into the userData struct
    let userData = fbData
    window.USERID = userData.id
    $('#userBadge').attr('src', userData.dataURL) //Set user badge in navbar to profile pic
    userData.location = {};
    userData.location.lat = locationData.coords.latitude;
    userData.location.lon = locationData.coords.longitude;
    return userData
  })
  .then(checkForNewUser) //check to see if user has no likes or catagories and if so alert them
  .then(DB.updateUserInfo) //update user info from fb and location data in DB
  .then(DB.compareUser) //compare user to others in DB and return matching users
  .catch(err => {
    console.log('Error! could not get data - ', err)
  })
  
}

function displayData([matchingUsers, userDataDoc]) {
  let userData = userDataDoc.data()

  $('#login').hide()
  $('#logout').show()
  $('#main-div').hide()
  $('#userBadge').show()
  $('#editProfile').show()

  // makeUserDiv(userData)
  var sortedMatchingUsers = matchingUsers.sort((a, b) => b.score - a.score);
  makeMatchDivs(sortedMatchingUsers)
  setLoadingScreen(false)
}

function checkForNewUser(userData) {
  let newUserPromise = new Promise(function(resolve, reject) {
    DB.getUser(userData)
    .then(user => {
      if (user.data()) {
        let userData = user.data()
        let userLikes = userData.likes
        let userCategories = userData.categories

        if (!userLikes || !userCategories) {
          setNewUserDialog()
        } else if (userLikes.length == 0 || userCategories.length ==0 ) {
          populateLikesInModalDialog(user.data())
          setNewUserDialog()
        } else {
          populateLikesInModalDialog(user.data())
        }
      } else (
        setNewUserDialog()
      )
      
      return user
    })
    .then(user => {
      resolve(userData)
    })
    
  })

  return newUserPromise
}

function populateLikesInModalDialog(userData) {
  let likes = userData.likes;
  let categories = userData.categories;

  let oldText = $('#userLikesInput').val();
  let newText = likes.join(',')
  $('#userLikesInput').val(newText)

  $('#userCategoriesInput').val(categories)
}

function makeUserDiv(userData) { //This function currently is not used but is left intact in case it is needed in the future
  let likes = userData.likes 
  let name = userData.name
  let dataURL = userData.dataURL
  let htmlOut = `
        <div class="card mb-3" style=" margin-top: 30px; border: solid 2px grey">
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

function makeMatchDivs(matchedUsers) { //Create cards for matched users
  let htmlOut = ``
  let degreeDivisions = 0;

  if (matchedUsers.length) {
    degreeDivisions = 360/matchedUsers.length
    let counter = 0;

    matchedUsers.forEach(user => {
      htmlOut += `
                  <div class="revolve-item" style="transform: rotateY(${counter*degreeDivisions}deg) translateZ(400px)">
                    <div class='leftArrow'>\⟨</div>
                    <div class='rightArrow'>\⟩</div>
                    <div class="match-image-container">
                        <img src="${user.dataURL}" alt="/images/noprof.png">
                    </div>
                    <div class="match-card-body">
                      <div>
                        <h3 class="text-shadow">${user.name.toUpperCase()}</h3>
                      </div>
                      <div ${user.matchingCategories ? '' : 'style="display:none"'}>
                        <small>Your shared interests:</small>
                        <div>
                          ${user.matchingCategories ? user.matchingCategories.map(category => {return `<span class="badge badge-pill badge-warning">${category}</span>`}).join('') : ''}
                        </div>
                      </div>
                      <div ${user.matchingLikes ? '' : 'style="display:none"'}>
                        <small>Your coinciding likes:</small>
                        <div>
                          ${user.matchingLikes ? user.matchingLikes.map(like => {return `<span class="badge badge-pill badge-secondary">${like.trim().charAt(0).toUpperCase() + like.trim().slice(1)}</span>`}).join('') : ''}
                        </div>
                      </div>
                    </div>
                  </div>
      `
      counter++
    })
  } else {
    htmlOut += `
                  <div class="revolve-item" style="transform: rotateY(0deg) translateZ(400px)">
                    <div class="match-image-container">
                        <img src="/images/noprof.png" alt="/images/noprof.png">
                    </div>
                    <div class="match-card-body">
                        <h3>Sorry!</h3>
                        <p>Looks like there's no matching users close to you right now.</p>
                        <p>Try updating your profile or check back later!</p>
                    </div>
                  </div>
    `

  }

  $('#matchCardParentContainer').html(htmlOut)
  $(".rightArrow").on("click", { d: "n" }, rotate);
  $(".leftArrow").on("click", { d: "p" }, rotate);

  // New carousel
  var carousel = $(".revolve"),
    currdeg  = 0;
  
  function rotate(e){
    if(e.data.d=="n" && degreeDivisions){
      currdeg = currdeg - degreeDivisions;
    }
    if(e.data.d=="p" && degreeDivisions){
      currdeg = currdeg + degreeDivisions;
    }
    carousel.css({
      "-webkit-transform": "rotateY("+currdeg+"deg)",
      "-moz-transform": "rotateY("+currdeg+"deg)",
      "-o-transform": "rotateY("+currdeg+"deg)",
      "transform": "rotateY("+currdeg+"deg)"
    });
  }
}

function addLikesToUserModal() { //This function simply dismisses the 'alert-no likes' modal and calls the 'change user likes' modal
    $('#noLikesModal').modal('hide')

    $('#addLikesModal').modal('show')
}


function updateUserLikesFromModal() {
    $('#addLikesModal').modal('hide')
    setLoadingScreen(true)
    let userLikesString = $('#userLikesInput').val()
    let userLikesRaw = userLikesString.split(',') 
    let userLikes =[];
    // remove leading/trailing whitespace and illegal chars
    userLikesRaw.forEach(function(el){
      el = el.trim().replace(/[|&;$%@"<>()+,]/g, '').toLowerCase();
      userLikes.push(el)
    })
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