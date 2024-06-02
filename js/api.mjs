export async function fetchCharacters(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("No results found.");
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

export async function getPageInfo(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.info;
  } catch (error) {
    console.log(error.message);
  }
}
