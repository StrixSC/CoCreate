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
}
