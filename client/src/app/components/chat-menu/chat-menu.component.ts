import { ChatSidebarService } from './../../services/chat-sidebar.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-menu',
  templateUrl: './chat-menu.component.html',
  styleUrls: ['./chat-menu.component.scss']
})
export class ChatMenuComponent implements OnInit {

  constructor(private chatSidebarService: ChatSidebarService) { }

  ngOnInit() {
  }

}
