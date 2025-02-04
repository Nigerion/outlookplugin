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

export function clearCookies() {
  setCookie("token", "", -1);
  setCookie("refresh", "", -1);
  window.location.reload(true);
}
// авторизация
export function authorization(username, password, setIsAuth) {
  const url = "https://vision.api-factory.ru/api/v1/users/auth/providers/keycloak/login/";
  const data = {
    email: username,
    password: password,
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка авторизации");
      }
      return response.json();
    })
    .then((data) => {
      if (data.user && data.user.accessToken && data.user.refreshToken && data.user.email) {
        setCookie("token", data.user.accessToken, 30);
        setCookie("refresh", data.user.refreshToken, 30);
        setCookie("user", data.user.email, 30);
        setIsAuth(true);
      } else {
        throw new Error("Ошибка авторизации");
      }
    })
    .catch((error) => {
      console.error("Ошибка:", error);
    });
}

export function tokenRefresh() {
  setCookie("token", "", -1);
  const url = "https://vision.api-factory.ru/api/v1/users/auth/token/refresh/";
  const token = getCookie("token");
  const refresh = getCookie("refresh");

  fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refresh }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка обновления токена");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.access) {
        setCookie("token", data.access, 30);
        console.log("gg");
      }
    })
    .catch((error) => {
      console.error("Ошибка при обработке ответа:", error);
    });
}

export function getFormSubject(callback) {
  Office.context.mailbox.item.subject.getAsync(function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const subject = asyncResult.value;
      callback(subject || "Meeting");
    }
  });
}

//получить время запуска формы
export function getFormStartTime(callback) {
  Office.context.mailbox.item.start.getAsync(function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const startTime = new Date(asyncResult.value);
      callback(startTime);
    }
  });
}
//получить время окончания формы
export function getFormEndTime(callback) {
  Office.context.mailbox.item.end.getAsync(function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const endTime = new Date(asyncResult.value);
      callback(endTime);
    }
  });
}

function insertTextMeetBody(link) {
  Office.context.mailbox.item.body.getAsync("html", function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const bodyHtml = asyncResult.value;
      const newBodyHtml = bodyHtml + link;
      Office.context.mailbox.item.body.setAsync(newBodyHtml, { coercionType: "html" }, function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          console.log("Ссылка добавлена успешно.");
        } else {
          console.error("Ошибка добавления ссылки: " + asyncResult.error.message);
        }
      });
    } else {
      console.error("Ошибка получения тела письма: " + asyncResult.error.message);
    }
  });
}

export function setDefaultSubject(subjectField) {
  Office.context.mailbox.item.subject.setAsync(subjectField, function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      console.log("Название встречи установлено успешно.");
    } else {
      console.error("Ошибка установки названия встречи: " + asyncResult.error.message);
    }
  });
}

export function updateMeeting(setConfId, subjectField, confDescription, startTimeField, endTimeField, confId) {
  const url = `https://vision.api-factory.ru/api/v1/conferences/`;
  const token = getCookie("token");
  const data = JSON.stringify({
    id: confId,
    title: subjectField,
    description: confDescription,
    started_at: startTimeField,
    ended_at: endTimeField,
  });

  fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Ошибка обновления встречи: ${response.status}`);
      }
    })
    .then((data) => {
      setConfId(data.id);
      const meetingUrl = `https://vision.api-factory.ru/meeting/${data.id}`;
      updateLocationField(meetingUrl);
      setDefaultSubject(subjectField);
    })
    .catch((error) => console.error("Ошибка при обновлении встречи:", error));
}

export function extractMeetingId(text) {
  const urlRegex = /https:\/\/vision\.api-factory\.ru\/meeting\/([a-f0-9\-]+)/i;
  const match = text.match(urlRegex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function updateLocationField(location) {
  Office.context.mailbox.item.location.setAsync(location, function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      console.log("Location updated successfully.");
    } else {
      console.error("Error updating location: " + asyncResult.error.message);
    }
  });
}

export function createNewMeeting(setConfId, subjectField, confDescription, startTimeField, endTimeField) {
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
        console.log(data);
        if (data && data.id) {
          setConfId(data.id);
          setDefaultSubject(subjectField);
          const meetingUrl = `https://vision.api-factory.ru/meeting/${data.id}`;
          updateLocationField(meetingUrl);
          insertTextMeetBody("<br><br>Ссылка для подключения:<br>" + meetingUrl);
        }
      } catch (error) {
        console.error("Ошибка при обработке ответа:", error);
      }
    }
  };
  xhr.send(data);
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
