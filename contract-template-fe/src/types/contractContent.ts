export type ContentBlock =
  | {
      type: "heading";
      level: 2 | 3 | 4;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      style: "bullet" | "number";
      items: string[];
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "callout";
      title?: string;
      text: string;
    };

export type ContractContentSection = {
  title?: string;
  blocks: ContentBlock[];
};

export type ContractContents = {
  introduction?: ContractContentSection;
  details?: ContractContentSection;
  guide?: ContractContentSection;
};

/**
 * Chỉ khai báo những trường component này cần.
 * Bạn có thể kết hợp type này với Contract hiện tại của dự án.
 */
