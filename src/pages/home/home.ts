import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { ToastController, ModalController } from 'ionic-angular';

import { PermissionsPage } from '../permissions/permissions';
import { ItemDetailsPage } from '../item-details/item-details';

import { PhotoLibrary, LibraryItem } from '@ionic-native/photo-library';

const THUMBNAIL_WIDTH = 512;
const THUMBNAIL_HEIGHT = 384;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  thumbnailWidth = THUMBNAIL_WIDTH + 'px';
  thumbnailHeight = THUMBNAIL_HEIGHT + 'px';
  public url: string = "https://res.cloudinary.com/mazu/video/upload/v1494350492/stage/mazufamily/twseyk688cqqu6uq7yhw.mp4";
  library: LibraryItem[];

  constructor(public navCtrl: NavController,
    private photoLibrary: PhotoLibrary, private platform: Platform, private cd: ChangeDetectorRef,
    private toastCtrl: ToastController, private modalCtrl: ModalController) {

    this.library = [];
    this.fetchPhotos();

  }

  saveMyVideo() {
    this.platform.ready().then(() => {

      this.photoLibrary.saveVideo(this.url,"someAlbum").then((result)=>{
console.log("result eh ",result);
      }).catch(err=>{
        console.log("error",err);
      });
    });
  }

  fetchPhotos() {

    this.platform.ready().then(() => {

      this.library = [];

      this.photoLibrary.getLibrary({ thumbnailWidth: THUMBNAIL_WIDTH, thumbnailHeight: THUMBNAIL_HEIGHT/*, chunkTimeSec: 0.3*/ }).subscribe({
        next: (chunk) => {
          this.library = this.library.concat(chunk);
          //this.library = this.library.slice(0, 9); // To take top 10 images
          this.cd.detectChanges();
        },
        error: (err: string) => {
          if (err.startsWith('Permission')) {

            let permissionsModal = this.modalCtrl.create(PermissionsPage);
            permissionsModal.onDidDismiss(() => {
              // retry
              this.fetchPhotos();
            });
            permissionsModal.present();

          } else { // Real error
            let toast = this.toastCtrl.create({
              message: `getLibrary error: ${err}`,
              duration: 6000,
            });
            toast.present();
          }
        },
        complete: () => {
          // Library completely loaded
        }
      });

    });

  }

  itemTapped(event, libraryItem) {
    this.navCtrl.push(ItemDetailsPage, {
      libraryItem: libraryItem
    });
  }

  trackById(index: number, libraryItem: LibraryItem): string { return libraryItem.id; }

}
