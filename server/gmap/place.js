const {Client} = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const encoder = require("base64-arraybuffer").encode;

const place = {};

place.getImgAndReview = async (name) => {
    const search = await client.findPlaceFromText({
        params: {
            key: process.env.BACK_GOOGLE_MAP_KEY,
            input: name,
            inputtype: "textquery",
            fields: ["photo","place_id"],
            language: "en"
        }
    }).catch(error => console.log(error));
    const placeID = search?.data?.candidates[0]?.place_id;
    const refPhotoRef = search?.data?.candidates[0]?.photos[0]?.photo_reference;

    const detail = await client.placeDetails({
        params: {
            key: process.env.BACK_GOOGLE_MAP_KEY,
            place_id: placeID,
            fields: ["reviews","photo"],
            language: "en"
        }
    }).catch(error => console.log(error));

    const {photos, reviews} = detail?.data?.result;
    const photoRef = photos?.map((p)=>p.photo_reference)?.slice(0,3);

    const refs = [refPhotoRef, ...photoRef];
    const promises = refs.map((ref)=> client.placePhoto({
        params: {
            key: process.env.BACK_GOOGLE_MAP_KEY,
            photoreference: ref,
            maxwidth: 600
        }
    }));
    const results = await Promise.all(promises).catch(error => console.log(error));
    const images = results.map(r => encoder(r.data));
    const review = reviews?.map((r)=>r.text?.replace(/(\r\n|\n|\r)/gm,""));

    return {
        refImage: images[0],
        hints: {
            images: images.slice(1),
            reviews: review
        }
    };
};

place.getRefImg = async (name) => {
    const search = await client.findPlaceFromText({
        params: {
            key: process.env.BACK_GOOGLE_MAP_KEY,
            input: name,
            inputtype: "textquery",
            fields: ["photo"],
            language: "en"
        }
    }).catch(error => console.log(error));

    const refPhotoRef = search?.data?.candidates[0]?.photos[0]?.photo_reference;
    const refPhoto = await client.placePhoto({
        params: {
            key: process.env.BACK_GOOGLE_MAP_KEY,
            photoreference: refPhotoRef,
            maxwidth: 600
        }
    }).catch(error => console.log(error));
    const image = encoder(refPhoto.data);

    return { refImage: image };
};

place.getNear = async (pos) => {
    const near = await client.placesNearby({
        params: {
            key: process.env.BACK_GOOGLE_MAP_KEY,
            location: [pos.lat, pos.lng],
            radius: 300,

        }
    }).catch(error => console.log(error));
    const results = near?.data?.results;
    const spots = results?.slice(0,10).map(e => e.geometry?.location);

    return {
        nearSpot: spots
    }
};

module.exports = place;