import Modal from "./Modal";

interface Notification {
  title: string;
  description: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

function NotificationModal({
  isOpen,
  onClose,
  notifications,
}: NotificationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-500 mb-4">No notifications</p>
        ) : (
          <div className="space-y-4 mb-4">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="border-b border-gray-500 pb-3 last:border-b-0"
              >
                <h3 className="font-medium text-gray-900 mb-1">
                  {notification.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {notification.description}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export { NotificationModal, type Notification };
