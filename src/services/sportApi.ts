const API_HOST = '/api/sofascore';

const fetchOptions = {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

export const fetchLiveEvents = async (sport: string) => {
  const url = `${API_HOST}/sport/${sport}/events/live`;
  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
  try { return JSON.parse(text); } catch (e) { return { rawText: text }; }
};

export const fetchEventDetails = async (id: string) => {
  const url = `${API_HOST}/event/${id}`;
  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
  try { return JSON.parse(text); } catch (e) { return { rawText: text }; }
};

export const fetchEventIncidents = async (id: string) => {
  const url = `${API_HOST}/event/${id}/incidents`;
  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
  try { return JSON.parse(text); } catch (e) { return { rawText: text }; }
};

export const fetchEventStatistics = async (id: string) => {
  const url = `${API_HOST}/event/${id}/statistics`;
  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
  try { return JSON.parse(text); } catch (e) { return { rawText: text }; }
};

export const fetchScheduledEvents = async (sport: string, date: string) => {
  const url = `${API_HOST}/sport/${sport}/scheduled-events/${date}`;
  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
  try { return JSON.parse(text); } catch (e) { return { rawText: text }; }
};

export const fetchEventLineups = async (id: string) => {
  const url = `${API_HOST}/event/${id}/lineups`;
  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
  try { return JSON.parse(text); } catch (e) { return { rawText: text }; }
};

export const fetchEventGraph = async (id: string) => {
  const url = `${API_HOST}/event/${id}/graph`;
  const response = await fetch(url, fetchOptions);
  if (response.status === 404) return { graphPoints: [] };
  const text = await response.text();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${text}`);
  try { return JSON.parse(text); } catch (e) { return { rawText: text }; }
};
