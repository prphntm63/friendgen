$(document).ready(function() {
    window.USERID = undefined
    
    $('#addLikesToUser').on('click', addLikesToUserModal) // These are the 'submit' buttons on the modal dialogs
    $('#updateUserLikes').on('click', updateUserLikesFromModal)
    $('#privacyPolicyLink').on('click', function() {
      $('#privacyPolicy').modal('show')
    })
    $('#deleteUserProfile').on('click', function() {
      $('#addLikesModal').modal('hide')
      $('#deleteConfirm').modal('show')
    })
    $('#deleteUserProfileConfirm').on('click', deleteProfile)

    $('#logout').hide() //Hide the user logged in buttons by default
    $('#userBadge').hide()
    $('#editProfile').hide()
    $('#messages').hide()
    $('#unreadMessagesBadge').hide()

    // Navbar 'edit profile' and 'logout' options
    $('#editProfile').on('click', addLikesToUserModal)
    $('#messages').on('click', getMessages)
    $('#logout').on('click', logout)
    $('#login').on('click', clickLogin)

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

    setInterval(function() {
      if ( document.hidden ) { return; }
      if(USERID){
          getLocation()
          .then(locationData => {
              // console.log(USERID, locationData.coords.latitude, locationData.coords.longitude)
              let userData = {}
              userData.id = USERID
              userData.location = {}
              userData.location.lat = locationData.coords.latitude;
              userData.location.lon = locationData.coords.longitude;
              DB.updateUserStatus(userData);
          })
          .catch(error => {
            console.log("Error updating location - ", error)
          })
      }
    }, 60000)
   
    
})

function clickLogin() {
  $('#main-div').hide() //Hide the main login button
  
  // setLoadingScreen(true) //set loading
  makeLoadingDivs()
  spinCarousel()

  getData() //Get user and matching users from database
  .then(displayData) //render data
}

function logout() {
  //This function should log out of facebook session and reload page

  FB.logout (function(response){
    DB.deauth()
    $('#login').show()
    $('#logout').hide()
    $('#background-wrap').show()
    $('#main-div').show()
    $('#matchCardParentContainer').html('')
    $('#userBadge').hide()
    $('#editProfile').hide()
    $('#messages').hide()
    $('#unreadMessagesBadge').hide()
    window.USERID = undefined;

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
  // .then(DB.authenticateAnon) //authenticate with DB - REMOVED to allow higher security auth with facebook
  .then(checkForNewUser) //check to see if user has no likes or catagories and if so alert them 
  .then(DB.updateUserInfo) //update user info from fb and location data in DB
  .then(updateUnreadMessageBadge) //UPDATE UNREAD MESSAGES BADGE
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
  $('#messages').show()

  var sortedMatchingUsers = matchingUsers.sort((a, b) => b.score - a.score);
  makeMatchDivs(sortedMatchingUsers)
  REVOLVE.stop = true;
  // setLoadingScreen(false)
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

function updateUnreadMessageBadge(userData) {
  if (!userData && USERID) {
    userData = {"id":USERID}
  }

  let unreadMessagePromise = new Promise(function(resolve, reject) {
    DB.getUser(userData)
    .then(userDocument => {
      let userDocumentData = userDocument.data();

      let unreadMessageCounter = 0;
      if(userDocumentData.messages){
        userDocumentData.messages.forEach(message => {
          if (message.unread) {
            unreadMessageCounter++
          }
        })
      }
      if (unreadMessageCounter) {
        $('#unreadMessagesBadge').text(unreadMessageCounter)
        $('#unreadMessagesBadge').show()
      }

      resolve(userData)
    })
  })

  return unreadMessagePromise
}

function populateLikesInModalDialog(userData) {
  let likes = userData.likes;
  let categories = userData.categories;

  // let newText = likes.map(like => {return like.trim().charAt(0).toUpperCase() + like.trim().slice(1)}).join(', ')
  let newText = likes.map(like => {return `<span contenteditable="false" class="badge badge-pill badge-secondary">${like.trim().charAt(0).toUpperCase() + like.trim().slice(1)} <a href="#" class="xRemove">&#x2613;</a></span>`}).join('')  
  
  $('#userLikesInput').html(newText)
  $('.xRemove').on('click', removeLikeFromList)
  $('#userLikesInput').on('keypress', updateLikesInList)

  $('#userCategoriesInput').val(categories)

  if (userData.preferences) {
    $('#maxUserDistance').val(userData.preferences.maxUserDistance)
    $('#maxUserTimeout').val(userData.preferences.maxUserTimeout)
  }
}

function removeLikeFromList(event) {
  $(this).parent().remove()
}

function updateLikesInList(event) {
  if (!(event.key === ',' || event.key === 'Enter' || event.key === ';')) {return}
  event.preventDefault()

  let likesHTML = $('#userLikesInput').html()
  let newValue = likesHTML.split('>').slice(-1)[0].trim()
  likesHTML = likesHTML.substring(0, likesHTML.length-newValue.length)
  likesHTML += `<span contenteditable="false" class="badge badge-pill badge-secondary">${newValue} <a href="#" class="xRemove">&#x2613;</a></span>`
  $('#userLikesInput').html(likesHTML)
  $('.xRemove').on('click', removeLikeFromList)
  $('#userLikesInput').focus()
  document.execCommand('selectAll', false, null);
  document.getSelection().collapseToEnd();
}



function sendMessage(event) {
  event.stopPropagation();
  let targetUser = {"id":event.currentTarget.parentNode.parentNode.id};
  let userData = {"id":USERID};
  $('#messageModal').modal('show')
  $('#sendMessage').on('click', function(){
    $('#sendMessage').unbind()
    let messageText = $('#messageText').val()
    let messageSubject = $('#messageSubject').val()
    messageText = messageText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let message = {"subject":messageSubject,"text":messageText};

    DB.sendMessage(userData, targetUser, message)
    .then(function() {
      $('#messageText').val('')
      $('#messageSubject').val('')
      $('#messageModal').modal('hide')
      $('#messageSentModal').modal('show')
      console.log('Message sent!')
    })
    .catch(error => {
      console.log('Message not sent...')
    })
  })
}


function addLikesToUserModal() { //This function simply dismisses the 'alert-no likes' modal and calls the 'change user likes' modal
    $('#noLikesModal').modal('hide')

    $('#addLikesModal').modal('show')
}


function updateUserLikesFromModal() {
    $('#addLikesModal').modal('hide')
    // setLoadingScreen(true)
    let userLikesString = $('#userLikesInput').html()
    // let userLikesRaw = userLikesString.split(',') 
    $('#userLikesInput').find('.xRemove').replaceWith(',')
    let userLikesRaw = $('#userLikesInput').text().split(',')
    $('#userLikesInput').html(userLikesString)
    let userLikes =[];
    // remove leading/trailing whitespace and illegal chars
    userLikesRaw.forEach(function(el){
      el = el.trim().replace(/[|&;$%@"<>()+,]/g, '').toLowerCase();
      if (el != '' && el != ' ') {
        userLikes.push(el)
      }
    })
    let userCategories = $('#userCategoriesInput').val()

    let userData = {
        id: USERID,
        likes: userLikes,
        categories: userCategories,
        preferences: {
          "maxUserDistance":$('#maxUserDistance').val(),
          "maxUserTimeout":$('#maxUserTimeout').val()
        }
    }

    DB.updateUserInfo(userData)
    .then(DB.compareUser)
    .then(displayData)
    
}

function getMessages() {
  let userData = {"id":USERID}
  let htmlOut = '';
  let idx = 0;

  DB.getMessages(userData)
  .then(messages => {
    if (messages.length) {
      let sentUserPromises = [];

      messages.forEach(message => {
        let messagePromise = new Promise(function(resolve, reject) {
          DB.getUser({"id":message.sender})
          .then(sentUserDocument => {
            let sentUser = sentUserDocument.data();
            message.dataURL = sentUser.dataURL;
            message.senderName = sentUser.name;
            resolve(message)
          })
        })

        sentUserPromises.push(messagePromise)
      })

      Promise.all(sentUserPromises)
      .then(messages => {
        messages.forEach(message => {
          htmlOut += `<div class="card" id="${message.messageId}">
                    <div class="card-header d-inline-flex py-0 ${message.unread ? 'unread' : ''}" id="${'heading'+idx}">
                      <div class="mr-auto">
                        <img class="d-inline-block" src="${message.dataURL ? message.dataURL : "/images/noprof.png"}" style="width:30px;height:30px;object-fit:cover;border-radius:50%;">
                        <h5 class="mb-0 d-inline-block">
                            <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#${'collapse'+idx}" aria-expanded="false" aria-controls="${'collapse'+idx}" style="text-decoration:none;">
                              <span class="badge badge-pill badge-warning">${message.senderName ? message.senderName : 'Anonymous'}</span> ${message.subject ? message.subject : 'Message!'}
                            </button>
                        </h5>
                      </div>
                      <div class="ml-auto">
                        <a href="#" class="d-inline-block ml-auto message-reply">
                          &#x2BB0;
                        </a>
                        <a href="#" class="d-inline-block ml-auto message-delete">
                          &#x1F5D1;
                        </a>
                      </div>
                    </div>

                    <div id="${'collapse'+idx}" class="collapse" aria-labelledby="${'heading'+idx}" data-parent="#inboxContainer">
                      <div class="card-body">
                        ${message.message}
                      </div>
                    </div>
                </div>`
          idx++
        })

        $('#inboxContainer').html(htmlOut)
        // Attach read, reply, and delete methods
        $('.unread').on('click', markMessageRead)
        $('.message-delete').on('click', deleteMessage)
        $('.message-reply').on('click', replyMessage)
        $('#inboxModal').modal('show')
        updateUnreadMessageBadge()
      })

    } else {
      htmlOut += '<div><p>No Messages</p></div>'
      $('#inboxContainer').html(htmlOut)
      $('#inboxModal').modal('show')
    }
      
  })

}

function markMessageRead(event) {
  let messageId = event.target.parentNode.parentNode.parentNode.parentNode.id
  DB.markMessageRead(messageId)
  $(this).removeClass('unread')
  let oldMessageCount = parseInt($('#unreadMessagesBadge').text())
  if (oldMessageCount > 1) {
    $('#unreadMessagesBadge').text(oldMessageCount-1)
  } else {
    $('#unreadMessagesBadge').hide()
  }
}

function deleteMessage(event) {
  event.stopPropagation()
  let messageId = event.target.parentNode.parentNode.parentNode.id
  DB.deleteMessage(messageId)
  .then(messageId => {
    $(this).parent().parent().parent().remove()
    updateUnreadMessageBadge()
  })
  
}

function replyMessage(event) {
  event.stopPropagation()
  let messageId = event.target.parentNode.parentNode.parentNode.id
  
  DB.markMessageRead(messageId)
  .then(DB.getMessageFromMessageId)
  .then(message => {
    updateUnreadMessageBadge()
    let targetUser = {"id":message.sender};
    let userData = {"id":USERID};
    $('#inboxModal').modal('hide')
    $('#messageModal').modal('show')
    $('#sendMessage').on('click', function(){
      $('#sendMessage').unbind()
      let messageText = $('#messageText').val()
      let messageSubject = $('#messageSubject').val()
      messageText = messageText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let replyMessage = {"subject":messageSubject,"text":messageText};

      DB.sendMessage(userData, targetUser, replyMessage)
      .then(function() {
        $('#messageText').val('')
        $('#messageSubject').val('')
        $('#messageModal').modal('hide')
        $('#messageSentModal').modal('show')
        console.log('Message sent!')
      })
      .catch(error => {
        console.log('Message not sent...')
      })
    })
  })
}

function deleteProfile() {
  let userData = {
    id: USERID
  }

  DB.deleteUser(userData)
  .then(function() {
    $('#deleteConfirm').modal('hide')
    $('#deleteSuccess').modal('show')
    logout()
  })
  
}

// // Test Message Generator (press 'm' to generate a test message)
// $(document).keypress(generateTestMessage)

// function generateTestMessage(event) {
//   console.log(event)
//   event.stopPropagation();
//   if (event.key != 'm') return
//   console.log('generated test message')

//   let targetUser = {"id":USERID};
//   let userData = {"id":USERID};
//   let messageText = 'This is a test message'
//   let messageSubject = 'Test Message'
//   messageText = messageText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//   let message = {"subject":messageSubject,"text":messageText};

//   DB.sendMessage(userData, targetUser, message)
//   .then(function() {
//     $('#messageText').val('')
//     $('#messageSubject').val('')
//     $('#messageModal').modal('hide')
//     updateUnreadMessageBadge()
//     console.log('Message sent!')
//   })
//   .catch(error => {
//     console.log('Message not sent...')
//   })
// }