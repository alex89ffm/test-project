import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from './product.service';
import { IProduct} from './product';

@Component({
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  pagetitle: string = 'Product Detail';
  product: IProduct;
  errorMessage: String = '';
  constructor(private _route: ActivatedRoute, private _productService: ProductService, private _router: Router ) {

  }
  onBack(): void {
    this._router.navigate(['/products']);
  }

  ngOnInit() {
    const id = +this._route.snapshot.paramMap.get('id');
    this._productService.getProduct(id).subscribe(
      product => {
        this.product = product;
      },
      error => this.errorMessage = <any>error);
    this.pagetitle += `: ${id}`;
  }
}
