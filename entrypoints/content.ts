import { browser } from "wxt/browser";
import type { ActionRequest } from "@/src/types";
import {
  handleCopyData,
  handleInjectData,
  handleScrapeData,
  handleTransferData,
} from "@/src/utils";
import { useElementInspector } from "@/src/hooks/useElementInspector";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // 1. تهيئة الـ Inspector مرة واحدة خارج مستمع الرسائل
    const inspector = useElementInspector();

    browser.runtime.onMessage.addListener(
      (
        request: ActionRequest | { action: string; payload?: any },
        _sender,
        sendResponse: (response: any) => void,
      ) => {
        (async () => {
          try {
            const req = request as ActionRequest & { payload?: any };

            switch (req.action) {
              case "SCRAPE_DATA":
                sendResponse(handleScrapeData(req));
                break;

              case "INJECT_DATA":
                sendResponse(handleInjectData(req));
                break;

              case "TRANSFER_DATA": {
                const response = await handleTransferData(req);
                sendResponse(response);
                break;
              }

              case "COPY_DATA": {
                const response = await handleCopyData(req);
                sendResponse(response);
                break;
              }

              // 2. استدعاء startInspecting() عند تلقي الرسالة
              case "START_INSPECT": {
                inspector.startInspecting();
                sendResponse({ status: "success" });
                break;
              }

              default:
                sendResponse({ status: "error", message: "إجراء غير معروف." });
            }
          } catch (error: any) {
            sendResponse({ status: "error", message: error.message });
          }
        })();

        return true;
      },
    );
  },
});
