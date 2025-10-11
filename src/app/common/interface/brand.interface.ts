export interface Brand{
  id?: any,
  name: string,
  slug?: string,
  description: string,
  country: string | null | any,
  websiteUrl: string,
  logoUrl: File | undefined | null,
  bannerUrl: File | undefined,
  status?: boolean,
  createdAt?: Date,
  updatedAt?: Date,
  statusAt?: Date
}