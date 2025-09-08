import { TransportPayloadToast } from "next-box";

export const notifications: Record<string, TransportPayloadToast> = {
    INITIALIZATION_ERROR: {
        severity: "error",
        title: "Ошибка инициализации Nextbox",
        message: "Попробуйте загрузить страницу, проверьте доступность платформы Nextbox."
    },
    API_DOWNLOAD_ERROR: {
        severity: "error",
        title: "Ошибка загрузки данных",
    },
    API_DELETE_ERROR: {
        severity: "error",
        title: "Ошибка удаления данных",
    },
    API_GET_CONNECTIONS_ERROR: {
        severity: "error",
        title: "Ошибка загрузки подключений",
    }
};