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

export enum ChannelType {
  Team = "Team",
  Collaboration = "Collaboration",
  Public = "Public"
}

export interface IChannelResponse {
  name: string,
  channel_type: string,
  index: number,
  channel_id: string,
  is_owner: boolean,
  owner_username: string,
  online_members: { username: string, avatarUrl: string, status: string, userId: string }[]
}

export enum ConnectionEventType {
  Connection = 'Connection',
  Disconnection = 'Disconnection',
  CollaborationConnect = 'CollaborationConnect',
  CollaborationDisconnect = 'CollaborationDisconnect'
}

export interface IConnectionEventData {
  userId: string,
  roomId: string,
  onlineMemberCount: number
  username: string,
  avatarUrl: string,
  status: string
}

export interface IDisconnectionEventData {
  userId: string,
  roomId: string,
  onlineMemberCount: number
}

export type ISidebarChannel = IChannelResponse & {
  notificationCount: number,
  bgColor: string,
  textColor: string,
  muteNotification: boolean,
  messages: IMessageResponse[];
  onlineMembers: IOnlineChannelMember[]
}

export interface IOnlineChannelMember {
  status: string,
  username: string,
  avatarUrl: string,
  userId: string
}

export interface IMessageResponse {
  avatarUrl: string,
  channelId: string,
  createdAt: string,
  message: string,
  messageId: string,
  username: string,
}

export interface IMessageHttpResponse {
  avatar_url: string,
  message_data: string,
  message_id: string,
  sender_profile_id: string,
  timestamp: string,
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