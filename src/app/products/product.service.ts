import {Injectable} from '@angular/core';
import {IProduct} from './product';
import { Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

@Injectable()

export class ProductService {
  private _productUrl = 'http://localhost:3000/products';

  constructor(private _http: HttpClient) {
  }

  getProducts(): Observable<IProduct[]> {
    return this._http.get<IProduct[]>(this._productUrl)
          .catch(this.handleError);
  }
  getProduct(id: number): Observable<IProduct> {
    if (id === 0) {
      return Observable.of(this.initializeProduct());
    }

    return this._http.get<IProduct>(`${this._productUrl}/${id}`)
          .catch(this.handleError);  }

  private handleError(err: HttpErrorResponse) {
    console.log(err.message);
    return Observable.throw(err.message);
  }

  saveProduct(p: IProduct): Observable<IProduct> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    /*const options = new RequestOptions({ headers: headers });*/
    if (p.productId === 0) {
        return this.createProduct(p, headers);
    }
    return this.updateProduct(p, headers);
  }
  private createProduct(product: IProduct, headers: HttpHeaders): Observable<IProduct> {
      return this._http.post(this._productUrl, product, {headers})
          .do(data => console.log('createProduct: ' + JSON.stringify(data)))
          .catch(this.handleError);
  }

  private updateProduct(product: IProduct, headers: HttpHeaders): Observable<any> {
      const url = `${this._productUrl}/${product.productId}`;
      return this._http.put(url, product, {headers})
          .do(() => product)
          .map(r => this.extractData)
          .catch(this.handleError);
  }
  deleteProduct(id: number): Observable<any> {
    const url = `${this._productUrl}/${id}`;
    console.log(url);
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return this._http.delete(url, {headers})
        .do(() => this.extractData)
        .catch(this.handleError);
  }
  private extractData(response: Response) {
      const body = response.json();
      console.log('data is: ' + body.data);
      return body.data || {};
  }

      initializeProduct(): IProduct {
          // Return an initialized object
          return {
              productId: 0,
              productName: null,
              productCode: null,
              tags: [''],
              releaseDate: null,
              price: null,
              description: null,
              starRating: null,
              imageUrl: null
          };
      }
}
