/* eslint-disable react/prop-types */
const Notification = ({ notification }) => {
  if (!notification) return null;
  return (
    <div>
      <p style={{ color: notification.type === "info" ? "green" : "red" }}>
        {notification.message}
      </p>
    </div>
  );
};

export default Notification;
