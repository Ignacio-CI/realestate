(function() {
    const lat = 55.6061479;
    const lng = 12.9976604;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker;

    // Use Provider and Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService()

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true,
    })
    .addTo(mapa);

    // Detect the pin's movement and read its coordinates
    marker.on('moveend', function(e){
        marker = e.target

        const position = marker.getLatLng();
        mapa.panTo(new L.LatLng(position.lat, position.lng));

        // get street info by dropping the pin
        geocodeService.reverse().latlng(position, 13).run(function(error, result) {
            //console.log(result)
            marker.bindPopup(result.address.LongLabel)

            // Fill in the fields
            document.querySelector('.street').textContent = result?.address?.Address ?? '';
            document.querySelector('#street').value = result?.address?.Address ?? '';
            document.querySelector('#lat').value = result?.latlng?.lat ?? '';
            document.querySelector('#lng').value = result?.latlng?.lng ?? '';
        })

        console.log(position)
    })

})()