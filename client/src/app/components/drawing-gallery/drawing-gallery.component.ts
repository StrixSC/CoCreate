import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-drawing-gallery',
  templateUrl: './drawing-gallery.component.html',
  styleUrls: ['./drawing-gallery.component.scss']
})
export class DrawingGalleryComponent implements OnInit {

  constructor(
    private router: Router) { }

  ngOnInit() {
  }

  createDrawing(){    
    this.router.navigateByUrl("drawing");
  }
}
