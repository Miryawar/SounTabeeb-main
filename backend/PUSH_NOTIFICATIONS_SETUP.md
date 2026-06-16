# Push Notifications & Appointment Reminders Setup Guide

## Overview

This implementation provides:

- ✅ Push notifications via Expo
- ✅ Email notifications
- ✅ Automatic appointment reminders (scheduled for 24 hours before appointment)
- ✅ Real-time appointment status updates

## Installation

Run this command to install the new dependencies:

```bash
npm install expo-server-sdk node-cron
```

## Environment Variables

Add these to your `.env` file:

```EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Note**: For Gmail, use an App Password (not your regular password). Enable 2FA and generate an app password at <https://myaccount.google.com/apppasswords>

## Frontend Integration

### 1. Register Push Token on App Start

When user logs in or app starts, save their push token:

```typescript
import * as Notifications from "expo-notifications";
import axios from "axios";

// Request notification permissions
const { status } = await Notifications.requestPermissionsAsync();

// Get push token
const token = await Notifications.getExpoPushTokenAsync();

// Save to backend
await axios.post(
  "http://your-backend/api/users/push-token",
  { pushToken: token.data },
  {
    headers: { Authorization: `Bearer ${authToken}` },
  },
);
```

### 2. Set Up Notification Handler

```typescript
// Handle notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Listen for notifications
const subscription = Notifications.addNotificationResponseReceivedListener(
  (response) => {
    const data = response.notification.request.content.data;
    if (data.type === "appointment_reminder") {
      // Navigate to appointment details
      navigation.navigate("AppointmentDetails", {
        appointmentId: data.appointmentId,
      });
    }
  },
);
```

## Backend API Endpoints

### Save Push Token

**POST** `/api/users/push-token`

```json
{
  "pushToken": "ExponentPushToken[...]"
}
```

## Appointment Flow

### 1. Create Appointment

When a user books an appointment:

- Confirmation email is sent immediately
- Push notification is sent if user has push token

### 2. Cancel Appointment

When appointment is cancelled:

- Cancellation email is sent
- Push notification is sent

### 3. Doctor Updates Status

When doctor updates appointment status (confirmed/completed/cancelled):

- Push notification is sent to user

### 4. Automatic Reminder

Every hour, the scheduler checks for appointments in the next 24 hours:

- Email reminder is sent
- Push notification is sent
- `reminderSent` flag is set to prevent duplicate reminders

## Database Schema Changes

### Appointment Model

- Added `reminderSent` field (Boolean, default: false) to track if reminder has been sent

### User Model

- Added `pushToken` field (String) to store Expo push token

## Services

### notificationService.js

**sendPushNotification(pushToken, title, body, data)***

- Sends single push notification via Expo
- Returns { ok, message, failedTokens }

**sendBulkPushNotifications(pushTokens, title, body, data)***

- Sends notifications to multiple users
- Returns { ok, message, sent, failedTokens }

**sendAppointmentConfirmationEmail(...)**
**sendAppointmentReminderEmail(...)**
**sendAppointmentCancellationEmail(...)**

- Sends formatted HTML emails

### appointmentReminder.js

**startReminderScheduler()***

- Starts the cron job (runs every hour)
- Sends reminders for appointments in next 24 hours

**stopReminderScheduler()***

- Stops the scheduler (useful for testing)

**manuallyTriggerReminders()***

- Manually trigger reminders for testing

## Testing

### Test Push Notification

```bash
# Save token first
curl -X POST http://localhost:5000/api/users/push-token \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pushToken": "ExponentPushToken[...]"}'

# Create appointment - should receive push notification
```

### Test Email Notification

Check your email inbox for confirmation/reminder emails

### Test Reminder Scheduler

The scheduler runs every hour. To test manually:

Add this endpoint to test (optional):

```javascript
// Add to routes/appointments.js
router.post("/test-reminders", async (req, res) => {
  const appointmentReminder = require("../utils/appointmentReminder");
  await appointmentReminder.manuallyTriggerReminders();
  res.json({ message: "Reminders triggered" });
});
```

## Notification Types

1. **appointment_confirmed** - When appointment is booked
2. **appointment_reminder** - 24 hours before appointment
3. **appointment_cancelled** - When appointment is cancelled
4. **appointment_completed** - When doctor marks as completed

## Error Handling

- Invalid push tokens are tracked and returned in `failedTokens`
- Email errors are logged but don't block appointment creation
- Push notification errors are logged but don't block operations

## Production Notes

1. **Load Balancing**: If running multiple server instances, each will run the scheduler. Consider using distributed cron or a job queue (Bull, RabbitMQ) for production.

2. **Database Indexes**: The `reminderSent` field should be indexed for better query performance:

   ```javascript
   appointmentSchema.index({ date: 1, reminderSent: 1 });
   ```

3. **Expo Limits**:
   - Expo has rate limits (check their documentation)
   - For high volume, consider using Firebase Cloud Messaging

4. **Email Configuration**: For Gmail, use app-specific passwords. For production, consider:
   - SendGrid
   - AWS SES
   - Mailgun

## Troubleshooting

### Reminders not sending

1. Check if server is running (`appointmentReminder.startReminderScheduler()` should log on startup)
2. Verify `reminderSent` field is set to false
3. Check MongoDB connection

### Push notifications not received

1. Verify push token is valid (starts with `ExponentPushToken[`)
2. Check if user has notifications enabled on device
3. Verify internet connection

### Emails not sending

1. Check EMAIL_USER and EMAIL_PASSWORD in .env
2. Verify SMTP settings (Gmail requires app password, not regular password)
3. Check email logs in error console

## Next Steps

1. Install dependencies: `npm install expo-server-sdk node-cron`
2. Update `.env` with email credentials
3. Update frontend to register push token on login
4. Test the flow end-to-end
