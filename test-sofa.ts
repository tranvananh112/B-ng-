const testSofa = async () => {
  try {
    const res = await fetch('https://api.sofascore.com/api/v1/sport/football/events/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
};
testSofa();
