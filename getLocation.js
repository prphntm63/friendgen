function getLocation(){
    var promise = new Promise(function locateMe(resolve, reject){
    if('geolocation' in navigator){
        console.log('geolocation is available')
    
        navigator.geolocation.getCurrentPosition(function(position){
          
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            // document.getElementById('latitude').textContent = lat
            // document.getElementById('longitude').textContent = lon

            resolve(position)
        });
        
    } else {
        reject(err('geolocater is not available'))
        }

    
        
    });
    return promise
}

// promise.then(function(position){
//     console.log(position)

// }, function(err){
//     console.log(err)
// });

// console.log(promise)}

// gettCurrentPosition() method is used to return the lat et lon using the dot operator.
//     - takes in a function with position as it's perameter.
//         - inside this function we assigned the coordinates to lat et lon and posted it
//           to the id's "latitude" et "longitude".
//     - resolve(position) returns the coordinates.