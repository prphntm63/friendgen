function makeLoadingDivs() {
    let categories = ["Concerts/Events", "Cooking/Baking", "Outdoor Activities", "Shopping", "Travel"]
    let likes = ["Dogs", "Guitars", "Geocaching", "Skateboarding", "Boats", "Dogs", "Hip Hop"]
    let htmlOut = ''
    for (let idx=0; idx<6; idx++) {
        let randomCategoryNumber = Math.floor(Math.random() * categories.length)
        let randomLikeNumber = Math.floor(Math.random() * likes.length)        
        let matchingCategories = categories.slice(randomCategoryNumber)
        let matchingLikes = likes.slice(randomLikeNumber)
        htmlOut += `
                      <div class="revolve-item" style="transform: rotateY(${60*idx}deg) translateZ(400px)">
                        <div class="match-image-container">
                        <img src="/images/noprof.png" alt="/images/noprof.png">

                        </div>
                        <div class="match-card-body">
                            <div>
                                <h3>Random Friend</h3>
                            </div>
                            <div ${matchingCategories ? '' : 'style="display:none"'}>
                                <small>Your shared interests:</small>
                                <div>
                                    ${matchingCategories ? matchingCategories.map(category => {return `<span class="badge badge-pill badge-warning">${category}</span>`}).join('') : ''}
                                </div>
                            </div>
                            <div ${matchingLikes ? '' : 'style="display:none"'}>
                                <small>Your coinciding likes:</small>
                                <div>
                                    ${matchingLikes ? matchingLikes.map(like => {return `<span class="badge badge-pill badge-secondary">${like.trim().charAt(0).toUpperCase() + like.trim().slice(1)}</span>`}).join('') : ''}
                                </div>
                            </div>

                            
                        
                        </div>
                      </div>
                    `
    }
    $('#matchCardParentContainer').html(htmlOut)

    window.REVOLVE = {}
    window.REVOLVE.currdeg  = 0;
}

function makeMatchDivs(matchedUsers) { //Create cards for matched users
    let htmlOut = ``
    let degreeDivisions = 0;
    let currdeg = REVOLVE.currdeg;
  
    if (matchedUsers.length) {
      degreeDivisions = 360/matchedUsers.length
      let counter = 0;
  
      matchedUsers.forEach(user => {
        htmlOut += `
                    <div class="revolve-item ${counter===0 ? 'revolve-active':''}" id="revolve${counter}" style="transform: rotateY(${counter*degreeDivisions+currdeg}deg) translateZ(400px)" id="${user.id}">
                      <div class='leftArrow'>\⟨</div>
                      <div class='rightArrow'>\⟩</div>
                      <div class="match-image-container">
                          <img src="${user.dataURL ? user.dataURL :'/images/noprof.png' }" alt="/images/noprof.png">
                          <div class="badge badge-pill badge-light send-message">Message ${user.name ? user.name : 'Me'}!</div>
  
                      </div>
                      <div class="match-card-body">
                        <div>
                          <h3>${user.name ? user.name.toUpperCase() : ''}</h3>
                         
  
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
                      <div class="revolve-item" style="transform: rotateY(360deg) translateZ(400px)">
                        <div class='leftArrow'>\⟨</div>
                        <div class='rightArrow'>\⟩</div>
                        <div class="match-card-body" style="flex-grow:1">
                          <div>
                            <h3 class="text-shadow">AW MAN!</h3>
                          </div>
                          <div style="display:flex; flex-direction:column; align-items: center; justify-content:space-evenly; flex-grow:1">
                            <small>Looks like there's no matching users close to you right now.</small>
                            <small>Try updating your profile or try again later!</small>
                            <button type="button" class="btn btn-outline-warning btn-sm" id="addLikesToUser2">Update Profile</button>
                          </div>
                        </div>
                      </div>
                    `
    }
  
  
    let phonePictures = matchedUsers.map(function(user) {
      return `<div class="container phone-item">
                <div>
                  <img style=" height: 150px" src="${user.dataURL ? user.dataURL: 'images/noprof.png' }" alt="images/noprof.png">
                  <div class="badge badge-pill badge-light send-message">Message ${user.name ? user.name : 'Me'}!</div>
  
                </div>
                <div class="match-card-body">
                        <div>
                          <h3 class="text-shadow">${user.name ? user.name.toUpperCase() : ''}</h3>
                        </div>
                        <div ${user.matchingCategories ? '' : 'style="display:none"'}>
                          <small>Your shared interests:</small>
                        </div>
                        <div>
                            ${user.matchingCategories ? user.matchingCategories.map(category => {return `<span class="badge badge-pill badge-warning">${category}</span>`}).join('') : ''}
                        </div>
                        <div ${user.matchingLikes ? '' : 'style="display:none"'}>
                          <small>Your coinciding likes:</small>
                        </div>
                        <div>
                            ${user.matchingLikes ? user.matchingLikes.map(like => {return `<span class="badge badge-pill badge-secondary">${like.trim().charAt(0).toUpperCase() + like.trim().slice(1)}</span>`}).join('') : ''}
                        </div>
  
                        
                  </div>
              </div>`
    })
  
    
    $('#matchCardParentContainer').html(htmlOut)
    $('.send-message').on('click', sendMessage)
    $('#phone-pictures').html(phonePictures.join(""))
    // $('#phone-pictures').html(htmlOut)
  
    $('#addLikesToUser2').on('click', addLikesToUserModal)
    $(".rightArrow").on("click", { d: "n" }, rotate);
    $(".leftArrow").on("click", { d: "p" }, rotate);

    var carousel = $(".revolve")
    // currdeg  = 0;
    activeCounter = 0;

    function rotate(e){
        if(e.data.d=="n" && degreeDivisions){
          activeCounter++;
          currdeg = currdeg - degreeDivisions;
          $(".revolve-active").removeClass('revolve-active')
          $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
          function() {
            $(`#revolve${Math.floor((matchedUsers.length+(activeCounter%matchedUsers.length))%matchedUsers.length)}`).addClass('revolve-active')
          })
        }
        if(e.data.d=="p" && degreeDivisions){
          activeCounter--;
          currdeg = currdeg + degreeDivisions;
          $(".revolve-active").removeClass('revolve-active')
          $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
          function() {
            $(`#revolve${Math.floor((matchedUsers.length+(activeCounter%matchedUsers.length))%matchedUsers.length)}`).addClass('revolve-active')
          })
        }
        carousel.css({
          "-webkit-transform": "rotateY("+currdeg+"deg)",
          "-moz-transform": "rotateY("+currdeg+"deg)",
          "-o-transform": "rotateY("+currdeg+"deg)",
          "transform": "rotateY("+currdeg+"deg)"
        });
    }
}

function spinCarousel() {
    if (!window.REVOLVE) {
        window.REVOLVE = {}
        REVOLVE.animation = 0;
        REVOLVE.stop = false;
    } else if (window.REVOLVE.stop === undefined) {
        REVOLVE.animation = 0;
        REVOLVE.stop = false;
    }


    var carousel = $(".revolve")
    currdeg = REVOLVE.currdeg;

    if (REVOLVE.animation === 0) {
        $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', spinCarousel)
        carousel.css({
        "-webkit-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
        "-moz-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
        "-o-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
        "transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
        "transition-timing-function" : "ease-in"
        });
        REVOLVE.animation = 1
    
    } else if (REVOLVE.animation === 1) {
        currdeg = currdeg-1080

        carousel.css({
        "-webkit-transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
        "-moz-transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
        "-o-transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
        "transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
        "transition-timing-function" : "linear"
        });
        REVOLVE.animation = 2

    } else if (REVOLVE.animation === 2) {

        carousel.css({
        "-webkit-transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
        "-moz-transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
        "-o-transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
        "transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
        "transition-timing-function" : "linear"
        });
        
        if (REVOLVE.stop) {
        REVOLVE.animation = 3
        } else {
        REVOLVE.animation = 1
        }

    } else if (REVOLVE.animation === 3) {
        carousel.css({
        "-webkit-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
        "-moz-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
        "-o-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
        "transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
        "transition-timing-function" : "ease-out"
        });
        REVOLVE.animation = 4

    } else if (REVOLVE.animation === 4) {
        carousel.css({
        "-webkit-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
        "-moz-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
        "-o-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
        "transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
        "transition-timing-function" : "ease"
        });

        $('#revolve0').addClass('revolve-active')

        $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
        $(".revolve").unbind()
        })
        REVOLVE.animation = undefined;
        REVOLVE.stop = false;
        return
    }

    REVOLVE.currdeg = currdeg;
}
  
    // // New carousel
    // var carousel = $(".revolve")
    // var currdeg  = 0;
    // var activeCounter = 0;
    
    // function rotate(e){
    //   if(e.data.d=="n" && degreeDivisions){
    //     activeCounter++;
    //     currdeg = currdeg - degreeDivisions;
    //     $(".revolve-active").removeClass('revolve-active')
    //     $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
    //     function() {
    //       $(`#revolve${Math.floor((matchedUsers.length+(activeCounter%matchedUsers.length))%matchedUsers.length)}`).addClass('revolve-active')
    //     })
    //   }
    //   if(e.data.d=="p" && degreeDivisions){
    //     activeCounter--;
    //     currdeg = currdeg + degreeDivisions;
    //     $(".revolve-active").removeClass('revolve-active')
    //     $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
    //     function() {
    //       $(`#revolve${Math.floor((matchedUsers.length+(activeCounter%matchedUsers.length))%matchedUsers.length)}`).addClass('revolve-active')
    //     })
    //   }
    //   carousel.css({
    //     "-webkit-transform": "rotateY("+currdeg+"deg)",
    //     "-moz-transform": "rotateY("+currdeg+"deg)",
    //     "-o-transform": "rotateY("+currdeg+"deg)",
    //     "transform": "rotateY("+currdeg+"deg)"
    //   });
    // }
  
    // window.REVOLVE = {
    //   animation : 0,
    //   stop : false
    // }
  
    // spin()
  
    // setTimeout(function() {
    //   REVOLVE.stop = true;
    // }, 5000)
  
    // function spin(e) {
    //   console.log(currdeg)
  
    //   if (REVOLVE.animation === 0) {
    //   $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', spin)
    //     carousel.css({
    //       "-webkit-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
    //       "-moz-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
    //       "-o-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
    //       "transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
    //       "transition-timing-function" : "ease-in"
    //     });
    //     REVOLVE.animation = 1
  
    //   } else if (REVOLVE.animation === 1) {
    //     currdeg = currdeg-1080
  
    //     carousel.css({
    //       "-webkit-transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
    //       "-moz-transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
    //       "-o-transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
    //       "transform": "rotateY("+(Math.round(currdeg+540))+"deg) translate(0px, 20px)",
    //       "transition-timing-function" : "linear"
    //     });
    //     REVOLVE.animation = 2
  
    //   } else if (REVOLVE.animation === 2) {
  
    //     carousel.css({
    //       "-webkit-transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
    //       "-moz-transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
    //       "-o-transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
    //       "transform": "rotateY("+currdeg+"deg) translate(0px, -20px)",
    //       "transition-timing-function" : "linear"
    //     });
        
    //     if (REVOLVE.stop) {
    //       REVOLVE.animation = 3
    //     } else {
    //       REVOLVE.animation = 1
    //     }
  
    //   } else if (REVOLVE.animation === 3) {
    //     carousel.css({
    //       "-webkit-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
    //       "-moz-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
    //       "-o-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
    //       "transform": "rotateY("+(currdeg-120)+"deg) translate(0px, 10px)",
    //       "transition-timing-function" : "ease-out"
    //     });
    //     REVOLVE.animation = 4
  
    //   } else if (REVOLVE.animation === 4) {
    //     carousel.css({
    //       "-webkit-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //       "-moz-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //       "-o-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //       "transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //       "transition-timing-function" : "ease"
    //     });
  
    //     $('#revolve0').addClass('revolve-active')
  
    //     $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    //       $(".revolve").unbind()
    //     })
    //     REVOLVE.animation = undefined;
    //     REVOLVE.stop = false;
    //     return
    //   }
    // }
  
    // function spin(e) {
    //   carousel.css({
    //     "-webkit-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
    //     "-moz-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
    //     "-o-transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)",
    //     "transform": "rotateY("+(currdeg+170)+"deg) translate(0px, -10px)"
    //   });
    //   currdeg = Math.floor((currdeg-1080)/360)*360
  
    //   $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
    //   function() {
  
    //     carousel.css({
    //       "-webkit-transform": "rotateY("+(Math.round(currdeg/2))+"deg) translate(0px, 50px)",
    //       "-moz-transform": "rotateY("+(Math.round(currdeg/2))+"deg) translate(0px, 50px)",
    //       "-o-transform": "rotateY("+(Math.round(currdeg/2))+"deg) translate(0px, 50px)",
    //       "transform": "rotateY("+(Math.round(currdeg/2))+"deg) translate(0px, 50px)",
    //       "transition-timing-function" : "ease-in"
    //     });
  
    //     $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
    //     function() {
  
    //       carousel.css({
    //         "-webkit-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, -20px)",
    //         "-moz-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, -20px)",
    //         "-o-transform": "rotateY("+(currdeg-120)+"deg) translate(0px, -20px)",
    //         "transform": "rotateY("+(currdeg-120)+"deg) translate(0px, -20px)",
    //         "transition-timing-function" : "ease-out"
    //       });
  
    //       $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
    //       function() {
  
    //         carousel.css({
    //           "-webkit-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //           "-moz-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //           "-o-transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //           "transform": "rotateY("+currdeg+"deg) translate(0px, 0px)",
    //           "transition-timing-function" : "ease"
    //         });
  
    //         $('#revolve0').addClass('revolve-active')
  
    //         $(".revolve").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    //           $(".revolve").unbind()
    //         })
    //       });
  
    //     });
  
    //   });
    // }