import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { IProduct } from './product';
import { ActivatedRoute, Router  } from '@angular/router';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {

  pageTitle = 'Edit Product';
  product: IProduct;
  errorMessage: string = '';
  productForm: FormGroup;
  private sub: Subscription;
  get tags(): FormArray {
      return <FormArray>this.productForm.get('tags');
  }
  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private productService: ProductService) { }

  ngOnInit() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productCode: ['', Validators.required],
      releaseDate: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      starRating: ['', Validators.required],
      imageUrl: ['', Validators.required],
      tags: this.fb.array([])
    });

    this.sub = this.route.params.subscribe(
        params => {
            const id = +params['id'];
            this.getProduct(id);
    });
  }
  getProduct(id: number): void {
      this.productService.getProduct(id)
          .subscribe(
              (product: IProduct) => this.onProductRetrieved(product),
              (error: any) => this.errorMessage = <any>error
          );
  }
  onProductRetrieved(product: IProduct): void {
      if (this.productForm) {
          this.productForm.reset();
      }
      this.product = product;

      if (this.product.productId === 0) {
          this.pageTitle = 'Add Product';
      } else {
          this.pageTitle = `Edit Product: ${this.product.productName}`;
      }

      // Update the data on the form
      this.productForm.patchValue({
          productName: this.product.productName,
          productCode: this.product.productCode,
          starRating: this.product.starRating,
          description: this.product.description,
          releaseDate: this.product.releaseDate,
          price: this.product.price,
          imageUrl: this.product.imageUrl
      });
      this.productForm.setControl('tags', this.fb.array(this.product.tags || []));
  }
  addTag(): void {
      this.tags.push(new FormControl());
  }
  save(): void {
    if (this.productForm.dirty && this.productForm.valid) {
        // Copy the form values over the product object values
        const p = Object.assign({}, this.product, this.productForm.value);
        this.sub = this.productService.saveProduct(p)
            .subscribe(
                () => {
                  console.log('done');
                  this.onSaveComplete();
                },
                (error: any) => {
                  this.errorMessage = <any>error;
                  console.log('error: ' + this.errorMessage);
                }
            );
    } else if (!this.productForm.dirty) {
        this.onSaveComplete();
    }
  }
  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  onSaveComplete(): void {
      // Reset the form to clear the flags
      this.productForm.reset();
      this.router.navigate(['/products']);
  }

  deleteProduct(): void {
      if (this.product.productId === 0) {
          // Don't delete, it was never saved.
          this.onSaveComplete();
     } else {
          if (confirm(`Really delete the product: ${this.product.productName}?`)) {
              this.productService.deleteProduct(this.product.productId)
                  .subscribe(
                      () => this.onSaveComplete(),
                      (error: any) => this.errorMessage = <any>error
                  );
          }
      }
  }
}
