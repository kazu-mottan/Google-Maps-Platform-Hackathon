const {Client} = require("@googlemaps/google-maps-services-js");
const client = new Client({});

const directions = {};

directions.getRoute = async (start,goal,midpoint)=>{
    const result = await client.directions({
        params: {
            key: process.env.BACK_GOOGLE_MAP_KEY,
            origin: [start.lat, start.lng],
            destination: [goal.lat, goal.lng],
            mode: "walking",
            waypoints: midpoint.map(e => [e.position.lat, e.position.lng])
        }
    }).catch(error => console.log(error));
    const legs = result?.data?.routes[0]?.legs;
    const route = legs?.map((leg) =>{
        const part = leg.steps?.map((step) => step.end_location);
        part.unshift(leg.steps[0]?.start_location);
        return part;
    });
    return {route: route};
};

module.exports = directions;