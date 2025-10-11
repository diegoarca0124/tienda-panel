export interface BrandList{
  id: string,
  name: string,
  slug?: string,
  description: string,
  country: string | null | any,
  websiteUrl: string,
  logoUrl: File | undefined,
  bannerUrl: File | undefined,
  status: boolean,
  createdAt?: Date,
  updatedAt?: Date,
  statusAt?: Date
}