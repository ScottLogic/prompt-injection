const URL = "http://localhost:3001/email/";

async function clearEmails() {
  const response = await fetch(URL + "clear", {
    method: "POST",
  });
  return response.status === 200;
}

async function getSentEmails() {
  const response = await fetch(URL + "get", {
    method: "GET",
  });
  const data = await response.json();
  return data;
}

export { clearEmails, getSentEmails };
