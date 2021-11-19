export interface IChannelPayload {
  channel_id: string;
  collaboration_id: string | null;
  created_at: string;
  members: Array<{
    member: {
      profile: {
        avatar_url: string;
        username: string;
      };
    };
    messages: any;
  }>;
  name: string;
  type: string;
  updated_at: string;
}
