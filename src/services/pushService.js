async function sendPushNotification(expoPushToken, message) {
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: "Poultry Alert 🚨",
        body: message,
        data: { type: "alert" },
      }),
    });

    const result = await response.json();
    console.log("Push result:", result);
    return result;
  } catch (err) {
    console.error("Failed to send push:", err);
  }
}

module.exports = { sendPushNotification };