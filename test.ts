const API_KEY = 'd486069129msh0b8da27c0be5495p1d859djsn1739664b1f9a';
const API_HOST = 'sportapi7.p.rapidapi.com';

const testApi = async () => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const url = `https://${API_HOST}/api/v1/sport/football/scheduled-events/${date}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    const events = result.events || [];
    console.log(`Total scheduled events today: ${events.length}`);
    
    const vnEvents = events.filter(event => {
      const str = JSON.stringify(event).toLowerCase();
      return str.includes('vietnam') || str.includes('việt nam');
    });
    
    console.log(`Vietnam events: ${vnEvents.length}`);
    if (vnEvents.length > 0) {
      console.log(JSON.stringify(vnEvents[0].tournament, null, 2));
      console.log(vnEvents[0].homeTeam.name, 'vs', vnEvents[0].awayTeam.name);
    }
  } catch (error) {
    console.error(error);
  }
};

testApi();
