import { NgModule } from '@angular/core';
import { ProductListComponent } from './product-list.component';
import { ProductDetailComponent } from './product-detail.component';
import { ConvertToSpacesPipe } from './../shared/convert-to-spaces.pipe';
import { StarComponent } from './../shared/star.component';
import { ProductGuardService } from './product-guard.service';
import { ProductService } from './product.service';

import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { ProductEditComponent } from './product-edit.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {path: 'products', component: ProductListComponent },
      { path: 'products/:id',
        component: ProductDetailComponent,
        canActivate: [ProductGuardService]
      },
      { path: 'editProduct/:id', component: ProductEditComponent }
    ]),
    SharedModule
  ],
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    ConvertToSpacesPipe,
    ProductEditComponent
  ],
  providers: [
    ProductService,
    ProductGuardService
  ]
})
export class ProductModule { }
