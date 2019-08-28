function locateMe(){
    if('geolocation' in navigator){
        console.log('geolocation is available')
    
        navigator.geolocation.getCurrentPosition(function(position){
          
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            document.getElementById('latitude').textContent = lat
            document.getElementById('longitude').textContent = lon
    
             console.log(position)

            // const data = {lat, lon}
            // const options = {
            //     method: 'POST',
            //     headers: {
            //         'content-type': 'appication/json'
            //     },
            //     body: JSON.stringify(data)
            // }
            // fetch('/api', options)
        })
        } else {
        console.log('geolocater is not available')
        }
        
}

