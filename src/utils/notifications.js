import appwriteService from '../appwrite/config';

// Email notification templates
const EMAIL_TEMPLATES = {
  NEW_COMMENT: {
    subject: 'New comment on your post',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Comment on Your Post</h2>
        <p>Hello,</p>
        <p>Someone has commented on your post "<strong>${data.postTitle}</strong>":</p>
        <blockquote style="background: #f3f4f6; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
          ${data.commentContent}
        </blockquote>
        <p>
          <a href="${data.postUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Comment
          </a>
        </p>
        <p>Best regards,<br>MegaBlog Team</p>
      </div>
    `
  },
  NEW_POST: {
    subject: 'New post published',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Post Published</h2>
        <p>Hello,</p>
        <p>A new post has been published: "<strong>${data.postTitle}</strong>"</p>
        <p>${data.postExcerpt}</p>
        <p>
          <a href="${data.postUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Read Post
          </a>
        </p>
        <p>Best regards,<br>MegaBlog Team</p>
      </div>
    `
  }
};

// Notification types
export const NOTIFICATION_TYPES = {
  COMMENT: 'comment',
  LIKE: 'like',
  FOLLOW: 'follow',
  NEW_POST: 'new_post',
};

// Create in-app notification
export const createNotification = async (notificationData) => {
  try {
    const notification = await appwriteService.createNotification(notificationData);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Send email notification (simplified - in a real app you'd use a service like SendGrid, Mailgun, etc.)
export const sendEmailNotification = async (to, type, data) => {
  try {
    const template = EMAIL_TEMPLATES[type.toUpperCase()];
    if (!template) {
      console.error('Unknown email template type:', type);
      return false;
    }

    // In a real application, you would integrate with an email service
    // For now, we'll just log the email that would be sent
    console.log('Email notification would be sent:', {
      to,
      subject: template.subject,
      html: template.template(data)
    });

    // You could integrate with services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Appwrite Functions with email service
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Combined notification sender
export const sendNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId,
  emailData = null
}) => {
  try {
    // Always create in-app notification
    const inAppNotification = await createNotification({
      userId,
      type,
      title,
      message,
      relatedId,
    });

    // Send email notification if email data is provided
    if (emailData && emailData.email) {
      await sendEmailNotification(emailData.email, type, emailData);
    }

    return inAppNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// Specific notification helpers
export const notifyNewComment = async (postAuthorId, commentData, postData) => {
  return sendNotification({
    userId: postAuthorId,
    type: NOTIFICATION_TYPES.COMMENT,
    title: 'New comment on your post',
    message: `Someone commented on "${postData.title}"`,
    relatedId: postData.$id,
    emailData: {
      email: 'author@example.com', // In real app, get from user profile
      postTitle: postData.title,
      commentContent: commentData.content,
      postUrl: `${window.location.origin}/post/${postData.$id}`,
    }
  });
};

export const notifyNewPost = async (subscriberIds, postData) => {
  const notifications = [];
  
  for (const subscriberId of subscriberIds) {
    const notification = await sendNotification({
      userId: subscriberId,
      type: NOTIFICATION_TYPES.NEW_POST,
      title: 'New post published',
      message: `New post: "${postData.title}"`,
      relatedId: postData.$id,
      emailData: {
        email: 'subscriber@example.com', // In real app, get from user profile
        postTitle: postData.title,
        postExcerpt: postData.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        postUrl: `${window.location.origin}/post/${postData.$id}`,
      }
    });
    
    if (notification) {
      notifications.push(notification);
    }
  }
  
  return notifications;
};

// Newsletter subscription (placeholder)
export const subscribeToNewsletter = async (email) => {
  try {
    // In a real app, you'd save this to a newsletter service or database
    console.log('Newsletter subscription:', email);
    return true;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return false;
  }
};

export default {
  createNotification,
  sendEmailNotification,
  sendNotification,
  notifyNewComment,
  notifyNewPost,
  subscribeToNewsletter,
  NOTIFICATION_TYPES,
};