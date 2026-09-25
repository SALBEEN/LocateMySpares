import { toast as sonnerToast } from "sonner";

export const showToast = {
  success: (message) => {
    sonnerToast.success(message, {
      className: "dark:bg-gray-800 dark:text-white dark:border-gray-700",
    });
  },
  error: (message) => {
    sonnerToast.error(message, {
      className: "dark:bg-gray-800 dark:text-white dark:border-gray-700",
    });
  },
  info: (message) => {
    sonnerToast.info(message, {
      className: "dark:bg-gray-800 dark:text-white dark:border-gray-700",
    });
  },
  warning: (message) => {
    sonnerToast.warning(message, {
      className: "dark:bg-gray-800 dark:text-white dark:border-gray-700",
    });
  },
};
