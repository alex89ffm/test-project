import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
import { NumberValidators } from '../shared/number.validator';
import { GenericValidator } from '../shared/generic-validator';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy, AfterViewInit {

  pageTitle = 'Edit Product';
  product: IProduct;
  errorMessage: string = '';
  productForm: FormGroup;
  private sub: Subscription;
  get tags(): FormArray {
      return <FormArray>this.productForm.get('tags');
  }
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService) {
      this.validationMessages = {
          productName: {
              required: 'Product name is required.',
              minlength: 'Product name must be at least three characters.',
              maxlength: 'Product name cannot exceed 50 characters.'
          },
          productCode: {
              required: 'Product code is required.'
          },
          price: {
            required: 'Product Price is required.'
          },
          starRating: {
              range: 'Rate the product between 1 (lowest) and 5 (highest).'
          },
          description: {
            required: 'Product Description is required.'
          }
      };

      // Define an instance of the validator for use with this form,
      // passing in this form's set of validation messages.
      this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      productCode: ['', Validators.required],
      releaseDate: '',
      price: ['', Validators.required],
      description: ['', Validators.required],
      starRating: ['', NumberValidators.range(1, 5)],
      imageUrl: '',
      tags: this.fb.array([])
    });

    this.sub = this.route.params.subscribe(
        params => {
            const id = +params['id'];
            this.getProduct(id);
    });
  }
  ngAfterViewInit(): void {
    this.productForm.valueChanges.debounceTime(800).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.productForm);
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
