let subjectField = "OutlookPlugin generated conference";
let confDescription = "Описание отсутсвует";
let locationField = "";
let confId = null;
let startTimeField = null;
let bodyField = "";
let endTimeField = null;
const token = getCookie("token");

function setCookie(name, value, minutes) {
  const date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 60 * 1000); // Устанавливаем срок на сутки
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + "; path=/";
}

export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function authenticateUser(username, password, setIsAuth) {
  const url = "https://vision.api-factory.ru/api/v1/users/auth/providers/keycloak/login/";
  const xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.user && data.user.accessToken && data.user.refreshToken && data.user.email) {
            setCookie("token", data.user.accessToken, 30);
            setCookie("refresh", data.user.refreshToken, 30);
            setCookie("user", data.user.email, 30);
            window.location.reload();
            setIsAuth(true);
          }
        } catch (error) {
          console.error("Ошибка при обработке ответа:", error);
          
        }
      } else {
        console.error("Ошибка аутентификации:", xhr.status);

      }
    }
  };
  const requestBody = JSON.stringify({
    email: username,
    password: password,
  });
  xhr.send(requestBody);
  setIsAuth(true);
}

export function tokenRefresh() {
  console.log("Token refresh");
  setCookie("token", "", -1);
  const xhr = new XMLHttpRequest();
  const url = "https://vision.api-factory.ru/api/v1/users/auth/token/refresh/";
  const token = getCookie("token");
  const refresh = getCookie("refresh");
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.setRequestHeader("Content-Type", "application/json");
  const data = JSON.stringify({
    refresh: refresh,
  });
  xhr.onreadystatechange = function () {
    console.log(xhr.responseText);
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data && data.access) {
            console.info("New token " + data.access);
            setCookie("token", data.access, 30);
          }
        } catch (error) {
          console.error("Ошибка при обработке ответа:", error);
        }
      }
    }
  };

  xhr.send(data);
}

function getFormSubject(callback) {
  Office.context.mailbox.item.subject.getAsync(function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const subject = asyncResult.value;
      if (subject !== null && subject.trim() !== "") {
        callback(subject);
      }
    }
  });
}
//получить тело собрания
function getMeetingBody(callback) {
  Office.context.mailbox.item.body.getAsync("html", function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const body = asyncResult.value;
      callback(body);
    } else {
      console.error("Error retrieving body text: " + asyncResult.error.message);
    }
  });
}
// получить местонахождение формы
function getFormLocation(callback) {
  Office.context.mailbox.item.location.getAsync(function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const location = asyncResult.value;
      callback(location);
    }
  });
}
//получить время запуска формы
function getFormStartTime(callback) {
  Office.context.mailbox.item.start.getAsync(function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const startTime = new Date(asyncResult.value);
      callback(startTime);
    }
  });
}
//получить время окончания формы
function getFormEndTime(callback) {
  Office.context.mailbox.item.end.getAsync(function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const endTime = new Date(asyncResult.value);
      callback(endTime);
    }
  });
}
function processSubject(subject) {
  updateMeeting();
  subjectField = subject;
}
// процес тела
function processBody(body) {
  bodyField = body;
}
//процес нахождения
function processLocation(location) {
  updateMeeting();
  locationField = location;
}
//время запуска
function processStartTime(startTime) {
  updateMeeting();
  startTimeField = startTime;
}
//время окончания
function processEndTime(endTime) {
  updateMeeting();
  endTimeField = endTime;
}
function extractMeetingId(text) {
  const urlRegex = /https:\/\/vision\.api-factory\.ru\/meeting\/([a-f0-9\-]+)/i;
  const match = text.match(urlRegex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function updateFields() {
  getFormSubject(processSubject);
  getFormLocation(processLocation);
  getFormEndTime(processEndTime);
  getFormStartTime(processStartTime);
  getMeetingBody(processBody);
  confId = extractMeetingId(locationField);
  confId = extractMeetingId(bodyField);
}

export function initializeApp() {
  Office.onReady(function (info) {
    if (info.host === Office.HostType.Outlook) {
      console.log("Host is Outlook");
      setInterval(updateFields, 1000);
    } else {
      console.log("Host is not Outlook");
    }
  });
}
function insertTextMeetBody(text) {
  console.log("Start insertConferenceLink");
  Office.context.mailbox.item.body.setAsync(text, { coercionType: "html" }, function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      console.log("Invitation text with link inserted successfully.");
    } else {
      console.error("Error inserting invitation text: " + asyncResult.error.message);
    }
  });
}
export function createNewMeeting(setData) {
  console.log("Create new meeting");
  const xhr = new XMLHttpRequest();
  const token = getCookie("token");
  const url = "https://vision.api-factory.ru/api/v1/conferences/";
  const data = JSON.stringify({
    title: subjectField,
    description: confDescription,
    started_at: startTimeField,
    ended_at: endTimeField,
  });

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 201) {
      console.log("Meeting created successfully:", xhr.responseText);
      try {
        const data = JSON.parse(xhr.responseText);
        if (data && data.id) {
          confId = data.id;
          link = "https://vision.api-factory.ru/meeting/" + data.id;
          insertTextMeetBody("<br><br>Ссылка для подключения:<br>" + link);
          updateMeetingLocation(link);
          setData(data);
        }
      } catch (error) {
        console.error("Ошибка при обработке ответа:", error);
      }
    }
  };
  xhr.send(data);
}
function updateMeetingLocation(locationText) {
  Office.context.mailbox.item.location.setAsync(locationText, function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      console.log("Location updated successfully.");
    } else {
      console.error("Error updating location: " + asyncResult.error.message);
    }
  });
}
export function formatDateDay(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
export function formatDateHour(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function updateMeeting(setData) {
  const xhr = new XMLHttpRequest();
  const url = "https://vision.api-factory.ru/api/v1/conferences/";
  const data = JSON.stringify({
    id: confId,
    title: subjectField,
    description: confDescription,
    started_at: startTimeField,
    ended_at: endTimeField,
  });

  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      if (data.id) {
        link = "https://vision.api-factory.ru/meeting/" + data.id;
        updateMeetingLocation(link);
        setData(data);
      }
    }
  };
  xhr.send(data);
}

export function clearCookies() {
  setCookie("token", "", -1);
  setCookie("refresh", "", -1);
  window.location.reload(true);
}
