export const calculateDistance = async (
    pickup,
    drop
) => {
    try {
        const apiKey =
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        // PICKUP GEO
        const pickupRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                pickup
            )}&components=country:IN&key=${apiKey}`
        );

        const pickupData = await pickupRes.json();

        if (
            !pickupData.results ||
            !pickupData.results.length
        ) {
            throw new Error("Pickup not found");
        }

        // DROP GEO
        const dropRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                drop
            )}&components=country:IN&key=${apiKey}`
        );

        const dropData = await dropRes.json();

        if (
            !dropData.results ||
            !dropData.results.length
        ) {
            throw new Error("Drop not found");
        }

        const pickupLocation =
            pickupData.results[0].geometry.location;

        const dropLocation =
            dropData.results[0].geometry.location;

        // DISTANCE MATRIX
        const distanceRes = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLocation.lat},${pickupLocation.lng}&destinations=${dropLocation.lat},${dropLocation.lng}&units=metric&key=${apiKey}`
        );

        const distanceData =
            await distanceRes.json();

        const element =
            distanceData.rows[0].elements[0];

        if (element.status !== "OK") {
            throw new Error("Distance failed");
        }

        const distanceKm =
            element.distance.value / 1000;

        return Math.round(distanceKm);
    } catch (err) {
        console.error("Distance API Error:", err);
        throw err;
    }
};