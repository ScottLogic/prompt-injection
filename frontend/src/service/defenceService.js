const URL = "http://localhost:3001/defence/";

async function getDefenceStatus() {
  const response = await fetch(URL + "status", {
    method: "GET",
  });
  const data = await response.json();
  return data;
}

async function activateDefence(id) {
  const response = await fetch(URL + "activate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ defenceId: id }),
  });
  return response.status === 200;
}

async function deactivateDefence(id) {
  const response = await fetch(URL + "deactivate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ defenceId: id }),
  });
  return response.status === 200;
}

async function transformInputPrompt(message) {
  const response = await fetch(URL + "transform", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  // convert from readable stream
  return response.body.getReader().read().then((result) => {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(result.value);
  });
}

export { getDefenceStatus, activateDefence, deactivateDefence, transformInputPrompt };
