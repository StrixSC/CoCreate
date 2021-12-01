export interface IChannel {
  channel_id: string;
  collaboration_id?: any;
  name: string;
  owner_username: string;
  type?: string;
  updated_at?: string;
  online_member_count?: number;
  member_count?: number;
  style?: Object;
  divStyle?: Object;
  btnStyle?: Object;
  unseen_messages?: number;
}

export interface IChannelResponse {
  name: string,
  index: number,
  channel_id: string,
  is_owner: boolean,
  owner_username: string,
}

export type ISidebarChannel = IChannelResponse & {
  notificationCount: number,
}

export interface IMessageResponse {
  avatarUrl: string,
  channelId: string,
  createdAt: string,
  message: string,
  messageId: string,
  username: string,
}

export interface IChannelCreatedResponse {
  channelId: string,
  channelName: string,
  ownerUsername: string;
  createdAt: string,
  updatedAt: string,
  collaborationId: string,
}