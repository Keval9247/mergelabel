import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, description ? { description } : undefined);
  },
  error: (message: string, description?: string) => {
    toast.error(message, description ? { description } : undefined);
  },
  info: (message: string, description?: string) => {
    toast.message(message, description ? { description } : undefined);
  },
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
};
