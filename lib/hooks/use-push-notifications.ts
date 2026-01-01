/**
 * usePushNotifications - Hook for Expo push notification registration
 */

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // expo-notifications v52+ requires these properties
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  loading: boolean;
  error: string | null;
}

/**
 * Register for push notifications and get the Expo push token.
 * Automatically sends the token to the backend when authenticated.
 */
export function usePushNotifications(isAuthenticated: boolean): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Only register for push notifications on physical devices
    if (!Device.isDevice) {
      setLoading(false);
      setError("Push notifications require a physical device");
      return;
    }

    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for when user interacts with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle notification tap - could navigate to specific screen
      console.log("Notification tapped:", response.notification.request.content);
    });

    return () => {
      // Use the .remove() method on the subscription object (expo-notifications v52+)
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Send token to backend when authenticated
  useEffect(() => {
    if (isAuthenticated && expoPushToken) {
      sendTokenToBackend(expoPushToken);
    }
  }, [isAuthenticated, expoPushToken]);

  return {
    expoPushToken,
    notification,
    loading,
    error,
  };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If not granted, request permissions
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permissions not granted");
    return null;
  }

  // Configure Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Get the Expo push token
  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  });

  return tokenResponse.data;
}

async function sendTokenToBackend(token: string): Promise<void> {
  try {
    const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
    // TODO: Implement registerPushToken RPC in AuthService
    // For now, log the token - the backend RPC needs to be added
    console.log("Push token to register:", { pushToken: token, platform });
    // await authClient.registerPushToken({
    //   pushToken: token,
    //   platform,
    // });
    console.log("Push token ready for backend registration");
  } catch (error) {
    console.error("Failed to prepare push token for backend:", error);
  }
}

/**
 * Request notification permissions manually
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds = 1,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
}
