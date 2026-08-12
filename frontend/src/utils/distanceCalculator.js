/**
 * 🚀 OSRM Free API மூலமாக இரண்டு இடங்களுக்கு இடைப்பட்ட
 * அசல் ரோடு நெடுஞ்சாலை தூரத்தை (Actual Road Highway Distance) கணக்கிடும் பங்க்ஷன்.
 */
export const calculateDistance = async (pickup, drop) => {
    if (!pickup || !drop) return 0;

    try {
        // 1. Pickup ஏரியாவின் அட்சரேகையை (Latitude/Longitude) கண்டுபிடிக்கிறோம்
        const geoPickup = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}`
        );
        const pickupData = await geoPickup.json();

        // 2. Drop ஏரியாவின் அட்சரேகையை கண்டுபிடிக்கிறோம்
        const geoDrop = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(drop)}`
        );
        const dropData = await geoDrop.json();

        if (pickupData.length && dropData.length) {
            const lat1 = pickupData[0].lat;
            const lon1 = pickupData[0].lon;

            const lat2 = dropData[0].lat;
            const lon2 = dropData[0].lon;

            // 🗺️ OSRM Free API மூலமா அசல் ரோடு தூரத்தை (Road Route Distance) எடுக்கிறோம்
            const routeRes = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
            );
            const routeData = await routeRes.json();

            if (routeData.routes && routeData.routes.length > 0) {
                // OSRM மீட்டரில் தரும், அதை கிலோமீட்டராக மாற்றி ரவுண்ட் செய்கிறோம்
                const distanceKm = Math.round(routeData.routes[0].distance / 1000);
                return distanceKm;
            }
        }
    } catch (err) {
        console.error("utils/distanceCalculator.js -ல் தூரம் கணக்கிட முடியவில்லை ❌: ", err);
    }

    return 0;
};