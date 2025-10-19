export interface BestWish {
    id: string;
    text: string;
    author: string;
    user_id: string | null;
    image_url: string | null;
    image_filename: string | null;
    image_size: number | null;
    created_at: string;
    updated_at: string;
    is_approved: boolean;
    is_deleted: boolean;
    event_id: string | null;
  }
  
  export interface WishReaction {
    id: string;
    wish_id: string;
    user_id: string;
    reaction_type: string;
    created_at: string;
  }
  
  export interface WishComment {
    id: string;
    wish_id: string;
    user_id: string;
    author: string;
    comment_text: string;
    created_at: string;
    is_deleted: boolean;
  }
  
  // For form submissions
  export interface CreateWishRequest {
    text: string;
    author: string;
    user_id?: string;
    image_url?: string;
    image_filename?: string;
    image_size?: number;
  }