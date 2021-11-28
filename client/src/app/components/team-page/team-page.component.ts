import { v4 } from 'uuid';
import { Component, OnInit } from '@angular/core';

export enum TeamType {
  Protected = "Protected",
  Public = "Public"
}

export interface Team {
  teamId: string,
  createdAt: string,
  teamName: string,
  bio: string,
  maxMemberCount: number,
  type: string,
  avatarUrl: string,
}

@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {

  mockTeams = [
    {
      teamId: v4(),
      createdAt: new Date().toISOString(),
      teamName: 'The Killer Jets',
      bio: "Duis eu qui commodo consequat eu.",
      maxMemberCount: 4,
      type: TeamType.Public,
      avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/TSM_Logo.svg/1200px-TSM_Logo.svg.png'
    } as Team,
    {
      teamId: v4(),
      createdAt: new Date().toISOString(),
      teamName: 'The Maroon Basses',
      bio: "Ullamco incididunt sint laboris commodo cupidatat labore laboris quis.",
      maxMemberCount: 10,
      type: TeamType.Protected,
      avatarUrl: 'https://liquipedia.net/commons/images/0/01/Cloud9_full_lightmode.png'
    } as Team,
    {
      teamId: v4(),
      createdAt: new Date().toISOString(),
      teamName: 'Team Lazy Serpents',
      bio: "Eiusmod duis nulla nisi consectetur dolore cillum Lorem labore.",
      maxMemberCount: 1,
      type: TeamType.Public,
      avatarUrl: 'https://pbs.twimg.com/profile_images/1410642391065776129/6RBEs5sC_400x400.png'
    } as Team
  ]

  isLoading: boolean = false;
  constructor() { }

  ngOnInit() {
    this.isLoading = false;
  }

}
