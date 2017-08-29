export interface IProduct {
  productId: number;
  productName: string;
  productCode: string;
  tags: string[];
  releaseDate: string;
  price: number;
  description: string;
  starRating: number;
  imageUrl: string;
}


export class Product {
  constructor (public productID: number = 0,
              public productName: string = '',
              public productCode: string = '',
              public tags: string[] = [''],
              public releaseDate: string = '',
              public price: number = 0,
              public description: string = '',
              public starRating: number = 0,
              public imageUrl: string = '') {}
}
