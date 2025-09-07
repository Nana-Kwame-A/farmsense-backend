const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPushNotification(expoPushToken, message) {
  try {
    console.log('Attempting to send push notification to:', expoPushToken);
    console.log('Message:', message);

    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error('Invalid Expo push token:', expoPushToken);
      return;
    }

    const messages = [{
      to: expoPushToken,
      sound: 'default',
      title: 'Farm Alert',
      body: message,
      data: { message },
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('Push notification tickets:', ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
}

module.exports = { sendPushNotification };